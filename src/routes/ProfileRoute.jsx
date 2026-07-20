import React, { useState } from "react";
import {
  changePassword,
  deleteUserAddress,
  getUserAddresses,
  saveUserAddress,
  setDefaultUserAddress,
  updateProfile,
} from "../utils/userStorage.js";
import { getAccessLabel } from "../utils/roles.js";

// โครงที่อยู่เปล่า สำหรับฟอร์มเพิ่มที่อยู่ใหม่
const emptyAddress = {
  label: "บ้าน",
  recipientName: "",
  phone: "",
  line1: "",
  district: "",
  province: "",
  postalCode: "",
  isDefault: false,
};

function ProfileRoute({ currentUser, setCurrentUser, setPage }) {
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [profileMessage, setProfileMessage] = useState(null);

  // ฟอร์มที่อยู่: null = ปิดอยู่, object = กำลังเพิ่ม/แก้ไข (ถ้ามี id คือแก้ไข)
  const [addressForm, setAddressForm] = useState(null);
  const [addressMessage, setAddressMessage] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState(null);

  if (!currentUser) {
    return (
      <section className="py-5">
        <div className="container text-center">
          <h1 className="page-title mb-3">My Profile</h1>
          <p className="lead text-muted">Please log in to manage your profile.</p>
          <button className="btn btn-boardhouse btn-lg" type="button" onClick={() => setPage("Login")}>
            Go to Login
          </button>
        </div>
      </section>
    );
  }

  const addresses = getUserAddresses(currentUser);

  function handleSaveProfile() {
    const result = updateProfile(currentUser, { name, email, phone });
    setProfileMessage({ ok: result.ok, text: result.message });

    if (result.ok) {
      setCurrentUser(result.user);
    }
  }

  function handleResetProfile() {
    setName(currentUser.name || "");
    setEmail(currentUser.email || "");
    setPhone(currentUser.phone || "");
    setProfileMessage(null);
  }

  // ----- Address book -----
  function openAddAddress() {
    setAddressMessage(null);
    setAddressForm({ ...emptyAddress, recipientName: currentUser.name || "", phone: currentUser.phone || "" });
  }

  function openEditAddress(address) {
    setAddressMessage(null);
    setAddressForm({ ...emptyAddress, ...address });
  }

  function updateAddressField(field, value) {
    setAddressForm((current) => ({ ...current, [field]: value }));
  }

  function handleSaveAddress() {
    const result = saveUserAddress(currentUser, addressForm);
    if (result.ok) {
      setCurrentUser(result.user);
      setAddressForm(null);
      setAddressMessage({ ok: true, text: result.message });
    } else {
      setAddressMessage({ ok: false, text: result.message });
    }
  }

  function handleDeleteAddress(addressId) {
    if (!confirm("ลบที่อยู่นี้ใช่ไหม?")) return;
    const result = deleteUserAddress(currentUser, addressId);
    if (result.ok) {
      setCurrentUser(result.user);
      setAddressMessage({ ok: true, text: result.message });
    } else {
      setAddressMessage({ ok: false, text: result.message });
    }
  }

  function handleSetDefault(addressId) {
    const result = setDefaultUserAddress(currentUser, addressId);
    if (result.ok) {
      setCurrentUser(result.user);
      setAddressMessage({ ok: true, text: result.message });
    } else {
      setAddressMessage({ ok: false, text: result.message });
    }
  }

  function handleChangePassword() {
    if (nextPassword !== confirmPassword) {
      setPasswordMessage({ ok: false, text: "รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน" });
      return;
    }

    const result = changePassword(currentUser, { currentPassword, nextPassword });
    setPasswordMessage({ ok: result.ok, text: result.message });

    if (result.ok) {
      setCurrentUser(result.user);
      setCurrentPassword("");
      setNextPassword("");
      setConfirmPassword("");
    }
  }

  return (
    <section className="py-5">
      <div className="container">
        <div className="auth-wrap mx-auto">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
            <div>
              <h1 className="page-title mb-2">My Profile</h1>
              <p className="lead text-muted mb-0">แก้ไขข้อมูลบัญชี ที่อยู่จัดส่ง และรหัสผ่านของคุณ</p>
            </div>
            <span className={`role-badge ${currentUser.role} flex-shrink-0`}>
              {getAccessLabel(currentUser)}
            </span>
          </div>

          {/* ===== ข้อมูลบัญชี ===== */}
          <form className="card shadow-sm p-4 vstack gap-3 mb-4">
            <h2 className="h5 mb-0">ข้อมูลบัญชี</h2>
            <label className="form-label">
              ชื่อ
              <input
                className="form-control form-control-lg mt-2"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label className="form-label">
              อีเมล / Username
              <input
                className="form-control form-control-lg mt-2"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="form-label">
              เบอร์โทรศัพท์
              <input
                className="form-control form-control-lg mt-2"
                inputMode="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>

            {profileMessage && (
              <p className={`mb-0 text-center ${profileMessage.ok ? "text-success" : "text-danger"}`}>
                {profileMessage.text}
              </p>
            )}
            <div className="d-flex flex-column flex-sm-row gap-2">
              <button
                className="btn btn-boardhouse btn-lg flex-grow-1"
                type="button"
                onClick={handleSaveProfile}
              >
                บันทึกข้อมูล
              </button>
              <button className="btn btn-outline-secondary btn-lg" type="button" onClick={handleResetProfile}>
                ยกเลิก
              </button>
            </div>
          </form>

          {/* ===== สมุดที่อยู่ (หลายที่อยู่) ===== */}
          <div className="card shadow-sm p-4 vstack gap-3 mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="h5 mb-0">ที่อยู่จัดส่ง</h2>
              {!addressForm && (
                <button className="btn btn-boardhouse btn-sm" type="button" onClick={openAddAddress}>
                  + เพิ่มที่อยู่
                </button>
              )}
            </div>
            <p className="small text-muted mb-0">
              บันทึกได้หลายที่อยู่ (เช่น บ้าน, ที่ทำงาน) แล้วเลือกใช้ตอนสั่งซื้อได้ ที่อยู่ "หลัก" จะถูกเลือกให้อัตโนมัติ
            </p>

            {addressMessage && (
              <p className={`mb-0 ${addressMessage.ok ? "text-success" : "text-danger"}`}>{addressMessage.text}</p>
            )}

            {addresses.length === 0 && !addressForm && (
              <p className="text-muted mb-0">ยังไม่มีที่อยู่ที่บันทึกไว้ กด "เพิ่มที่อยู่" เพื่อเริ่มต้น</p>
            )}

            {/* รายการที่อยู่ */}
            {addresses.map((addr) => (
              <div key={addr.id} className="border rounded p-3 d-flex flex-column flex-md-row justify-content-between gap-2">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <strong>{addr.label}</strong>
                    {addr.isDefault && <span className="badge bg-success-subtle text-success">ที่อยู่หลัก</span>}
                  </div>
                  <div className="text-muted small">
                    {addr.recipientName} &middot; {addr.phone}
                    <br />
                    {[addr.line1, addr.district, addr.province, addr.postalCode].filter(Boolean).join(", ")}
                  </div>
                </div>
                <div className="d-flex flex-md-column gap-2 justify-content-end">
                  {!addr.isDefault && (
                    <button className="btn btn-sm btn-outline-success" type="button" onClick={() => handleSetDefault(addr.id)}>
                      ตั้งเป็นหลัก
                    </button>
                  )}
                  <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => openEditAddress(addr)}>
                    แก้ไข
                  </button>
                  <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => handleDeleteAddress(addr.id)}>
                    ลบ
                  </button>
                </div>
              </div>
            ))}

            {/* ฟอร์มเพิ่ม/แก้ไขที่อยู่ */}
            {addressForm && (
              <div className="border rounded p-3 vstack gap-3 bg-light">
                <h3 className="h6 mb-0">{addressForm.id ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่ใหม่"}</h3>
                <label className="form-label mb-0">
                  ป้ายชื่อที่อยู่ (เช่น บ้าน, ที่ทำงาน)
                  <input
                    className="form-control mt-2"
                    value={addressForm.label}
                    onChange={(event) => updateAddressField("label", event.target.value)}
                  />
                </label>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label w-100 mb-0">
                      ชื่อผู้รับ
                      <input
                        className="form-control mt-2"
                        value={addressForm.recipientName}
                        onChange={(event) => updateAddressField("recipientName", event.target.value)}
                      />
                    </label>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label w-100 mb-0">
                      เบอร์โทรผู้รับ
                      <input
                        className="form-control mt-2"
                        inputMode="tel"
                        value={addressForm.phone}
                        onChange={(event) => updateAddressField("phone", event.target.value)}
                      />
                    </label>
                  </div>
                </div>
                <label className="form-label mb-0">
                  บ้านเลขที่ / ถนน
                  <input
                    className="form-control mt-2"
                    value={addressForm.line1}
                    onChange={(event) => updateAddressField("line1", event.target.value)}
                  />
                </label>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label w-100 mb-0">
                      เขต / อำเภอ
                      <input
                        className="form-control mt-2"
                        value={addressForm.district}
                        onChange={(event) => updateAddressField("district", event.target.value)}
                      />
                    </label>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label w-100 mb-0">
                      จังหวัด
                      <input
                        className="form-control mt-2"
                        value={addressForm.province}
                        onChange={(event) => updateAddressField("province", event.target.value)}
                      />
                    </label>
                  </div>
                </div>
                <label className="form-label mb-0">
                  รหัสไปรษณีย์
                  <input
                    className="form-control mt-2"
                    inputMode="numeric"
                    value={addressForm.postalCode}
                    onChange={(event) => updateAddressField("postalCode", event.target.value)}
                  />
                </label>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="address-default"
                    checked={Boolean(addressForm.isDefault)}
                    onChange={(event) => updateAddressField("isDefault", event.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="address-default">
                    ตั้งเป็นที่อยู่หลัก
                  </label>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-boardhouse flex-grow-1" type="button" onClick={handleSaveAddress}>
                    บันทึกที่อยู่
                  </button>
                  <button className="btn btn-outline-secondary" type="button" onClick={() => setAddressForm(null)}>
                    ยกเลิก
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ===== เปลี่ยนรหัสผ่าน ===== */}
          <form className="card shadow-sm p-4 vstack gap-3">
            <h2 className="h5 mb-0">เปลี่ยนรหัสผ่าน</h2>
            <label className="form-label">
              รหัสผ่านปัจจุบัน
              <input
                className="form-control form-control-lg mt-2"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </label>
            <label className="form-label">
              รหัสผ่านใหม่
              <input
                className="form-control form-control-lg mt-2"
                type="password"
                value={nextPassword}
                onChange={(event) => setNextPassword(event.target.value)}
              />
            </label>
            <label className="form-label">
              ยืนยันรหัสผ่านใหม่
              <input
                className="form-control form-control-lg mt-2"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </label>
            {passwordMessage && (
              <p className={`mb-0 text-center ${passwordMessage.ok ? "text-success" : "text-danger"}`}>
                {passwordMessage.text}
              </p>
            )}
            <button className="btn btn-boardhouse btn-lg w-100" type="button" onClick={handleChangePassword}>
              เปลี่ยนรหัสผ่าน
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ProfileRoute;
