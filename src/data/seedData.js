export const storageKeys = {
  products: "boardhouse-products",
  users: "boardhouse-users",
  currentUser: "boardhouse-current-user",
  cart: "boardhouse-cart",
  orders: "boardhouse-orders",
};

export const categories = ["All", "Strategy", "Family", "Party", "Card Games"];

export const paymentMethods = ["Credit Card", "Bank Transfer", "Cash on Delivery"];

export const orderStatuses = ["Paid", "Preparing Shipment", "In Transit", "Completed", "Cancelled"];

export const products = [
  {
    id: 1,
    name: "Catan",
    category: "Strategy",
    price: 39.99,
    stock: 12,
    ageRange: "10+",
    players: "3-4",
    playTime: "60-120 min",
    difficulty: "Medium",
    image: "/images/products/catan.jpg",
    description: "Trade, build, and settle an island in a classic strategy board game.",
  },
  {
    id: 2,
    name: "Ticket to Ride",
    category: "Family",
    price: 44.5,
    stock: 8,
    ageRange: "8+",
    players: "2-5",
    playTime: "30-60 min",
    difficulty: "Easy",
    image: "/images/products/ticket-to-ride.jpg",
    description: "Collect train cards and claim railway routes across the map.",
  },
  {
    id: 3,
    name: "Codenames",
    category: "Party",
    price: 19.99,
    stock: 25,
    ageRange: "10+",
    players: "2-8+",
    playTime: "15-30 min",
    difficulty: "Easy",
    image: "/images/products/codenames.jpg",
    description: "Give clever one-word clues to help your team find secret agents.",
  },
  {
    id: 4,
    name: "Wingspan",
    category: "Strategy",
    price: 59,
    stock: 5,
    ageRange: "10+",
    players: "1-5",
    playTime: "40-70 min",
    difficulty: "Medium",
    image: "/images/products/wingspan.jpg",
    description: "Build a wildlife preserve and attract beautiful birds to your habitats.",
  },
  {
    id: 5,
    name: "Uno",
    category: "Card Games",
    price: 9.99,
    stock: 40,
    ageRange: "7+",
    players: "2-10",
    playTime: "15-30 min",
    difficulty: "Easy",
    image: "/images/products/uno.jpg",
    description: "Match colors and numbers in a fast card game for everyone.",
  },
  {
    id: 6,
    name: "Azul",
    category: "Family",
    price: 34.99,
    stock: 10,
    ageRange: "8+",
    players: "2-4",
    playTime: "30-45 min",
    difficulty: "Medium",
    image: "/images/products/azul.jpg",
    description: "Draft colorful tiles and create a beautiful palace wall pattern.",
  },
  {
    id: 7,
    name: "Dixit",
    category: "Party",
    price: 29.99,
    stock: 15,
    ageRange: "8+",
    players: "3-8",
    playTime: "30 min",
    difficulty: "Easy",
    image: "/images/products/dixit.jpg",
    description: "Use dreamlike cards and creative clues to tell imaginative stories.",
  },
  {
    id: 8,
    name: "7 Wonders",
    category: "Strategy",
    price: 49.99,
    stock: 7,
    ageRange: "10+",
    players: "3-7",
    playTime: "30 min",
    difficulty: "Medium",
    image: "/images/products/7-wonders.jpg",
    description: "Lead an ancient city, draft cards, and build one of the seven wonders.",
  },
];

export const users = [
  {
    id: 1,
    role: "customer",
    name: "Jane Doe",
    email: "jane@example.com",
    password: "password",
    phone: "081-234-5678",
    address: {
      label: "Home",
      line1: "99/1 BoardHouse Street",
      district: "Bangkok",
      province: "Bangkok",
      postalCode: "10200",
    },
  },
  {
    id: 2,
    role: "admin",
    name: "BoardHouse Admin",
    email: "admin@boardhouse.test",
    password: "admin123",
    phone: "080-000-0000",
    address: null,
  },
];

export const currentUser = users[0];

export const cart = [
  { productId: 1, quantity: 2 },
  { productId: 3, quantity: 2 },
];

export const orders = [
  {
    id: "ORD-1001",
    userId: 1,
    date: "2026-06-20",
    items: "Catan, Uno",
    orderItems: [
      { productId: 1, name: "Catan", price: 39.99, quantity: 1 },
      { productId: 5, name: "Uno", price: 9.99, quantity: 1 },
    ],
    total: 49.98,
    status: "Completed",
    tone: "primary",
    paymentMethod: "Credit Card",
    shippingAddress: users[0].address,
  },
  {
    id: "ORD-1002",
    userId: 1,
    date: "2026-07-01",
    items: "Wingspan",
    orderItems: [{ productId: 4, name: "Wingspan", price: 59, quantity: 1 }],
    total: 59,
    status: "In Transit",
    tone: "soft",
    paymentMethod: "Bank Transfer",
    shippingAddress: users[0].address,
  },
  {
    id: "ORD-1003",
    userId: 1,
    date: "2026-07-05",
    items: "Codenames, Dixit",
    orderItems: [
      { productId: 3, name: "Codenames", price: 19.99, quantity: 1 },
      { productId: 7, name: "Dixit", price: 29.99, quantity: 1 },
    ],
    total: 49.98,
    status: "Preparing Shipment",
    tone: "soft",
    paymentMethod: "Cash on Delivery",
    shippingAddress: users[0].address,
  },
];

export const seedData = {
  [storageKeys.products]: products,
  [storageKeys.users]: users,
  [storageKeys.currentUser]: currentUser,
  [storageKeys.cart]: cart,
  [storageKeys.orders]: orders,
};
