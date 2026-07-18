import React, { useState } from "react";
import { changePassword, updateProfile } from "../utils/userStorage.js";
import { getAccessLabel } from "../utils/roles.js";

const emptyAddress = {
  label: "Home",
  line1: "",
  district: "",
  province: "",
  postalCode: "",
};

function ProfileRoute({ currentUser, setCurrentUser, setPage }) {
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [address, setAddress] = useState({ ...emptyAddress, ...(currentUser?.address || {}) });
  const [profileMessage, setProfileMessage] = useState(null);

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

  function updateAddress(field, value) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  // เว้นที่อยู่ทั้งก้อนไว้ได้ แต่ถ้ากรอกแล้วต้องกรอกให้ครบเพราะ Checkout ใช้ต่อ
  function validateAddress() {
    const filled = [address.line1, address.district, address.province, address.postalCode].filter(
      (value) => value.trim()
    );

    if (filled.length === 0 || filled.length === 4) {
      return null;
    }

    return "Please complete the full address, or leave every address field blank.";
  }

  function handleSaveProfile() {
    const addressError = validateAddress();

    if (addressError) {
      setProfileMessage({ ok: false, text: addressError });
      return;
    }

    const hasAddress = address.line1.trim() !== "";
    const result = updateProfile(currentUser, {
      name,
      email,
      phone,
      address: hasAddress ? address : null,
    });

    setProfileMessage({ ok: result.ok, text: result.message });

    if (result.ok) {
      setCurrentUser(result.user);
    }
  }

  function handleChangePassword() {
    if (nextPassword !== confirmPassword) {
      setPasswordMessage({ ok: false, text: "New passwords do not match." });
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

  function handleReset() {
    setName(currentUser.name || "");
    setEmail(currentUser.email || "");
    setPhone(currentUser.phone || "");
    setAddress({ ...emptyAddress, ...(currentUser.address || {}) });
    setProfileMessage(null);
  }

  return (
    <section className="py-5">
      <div className="container">
        <div className="auth-wrap mx-auto">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
            <div>
              <h1 className="page-title mb-2">My Profile</h1>
              <p className="lead text-muted mb-0">Update your account details and password.</p>
            </div>
            <span className={`role-badge ${currentUser.role} flex-shrink-0`}>
              {getAccessLabel(currentUser)}
            </span>
          </div>

          <form className="card shadow-sm p-4 vstack gap-3 mb-4">
            <h2 className="h5 mb-0">Account details</h2>
            <label className="form-label">
              Name
              <input
                className="form-control form-control-lg mt-2"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label className="form-label">
              Email / Username
              <input
                className="form-control form-control-lg mt-2"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="form-label">
              Phone
              <input
                className="form-control form-control-lg mt-2"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>

            <h2 className="h5 mb-0 mt-2">Default address</h2>
            <p className="small text-muted mb-0">Used to prefill the shipping form at checkout.</p>
            <label className="form-label">
              Label
              <input
                className="form-control form-control-lg mt-2"
                value={address.label}
                onChange={(event) => updateAddress("label", event.target.value)}
              />
            </label>
            <label className="form-label">
              Address
              <input
                className="form-control form-control-lg mt-2"
                value={address.line1}
                onChange={(event) => updateAddress("line1", event.target.value)}
              />
            </label>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label w-100">
                  District
                  <input
                    className="form-control form-control-lg mt-2"
                    value={address.district}
                    onChange={(event) => updateAddress("district", event.target.value)}
                  />
                </label>
              </div>
              <div className="col-md-6">
                <label className="form-label w-100">
                  Province
                  <input
                    className="form-control form-control-lg mt-2"
                    value={address.province}
                    onChange={(event) => updateAddress("province", event.target.value)}
                  />
                </label>
              </div>
            </div>
            <label className="form-label">
              Postal Code
              <input
                className="form-control form-control-lg mt-2"
                value={address.postalCode}
                onChange={(event) => updateAddress("postalCode", event.target.value)}
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
                Save Changes
              </button>
              <button className="btn btn-outline-secondary btn-lg" type="button" onClick={handleReset}>
                Cancel
              </button>
            </div>
          </form>

          <form className="card shadow-sm p-4 vstack gap-3">
            <h2 className="h5 mb-0">Change password</h2>
            <label className="form-label">
              Current Password
              <input
                className="form-control form-control-lg mt-2"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </label>
            <label className="form-label">
              New Password
              <input
                className="form-control form-control-lg mt-2"
                type="password"
                value={nextPassword}
                onChange={(event) => setNextPassword(event.target.value)}
              />
            </label>
            <label className="form-label">
              Confirm New Password
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
              Change Password
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ProfileRoute;
