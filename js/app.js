/* GharBazar Main Application Script with Live Firebase Firestore & Auth Integration */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot, addDoc, setDoc, doc, getDoc, getDocs, deleteDoc, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDhACx9RMzpI34qaXm7T_TfDos-crWycZA",
  authDomain: "gharbazar-d8f79.firebaseapp.com",
  projectId: "gharbazar-d8f79",
  storageBucket: "gharbazar-d8f79.firebasestorage.app",
  messagingSenderId: "374383787334"
};

const BUILT_IN_PRODUCTS = [
  {
    id: "blanket_cozy_fleece_black",
    name: "Cozy Fleece Printed Double Bed Blanket",
    pricePkr: 1949,
    category: "BLANKETS",
    fabric: "Fleece",
    size: "Double Bed, 89x90 inches",
    shortSpec: "Double Bed • 89x90 in • Fleece • Black",
    specs: [
      { label: "Bed Size", value: "Double Bed" },
      { label: "Dimensions", value: "89x90 inches" },
      { label: "Fabric", value: "Fleece" },
      { label: "Pattern", value: "Printed" },
      { label: "Color", value: "Black" }
    ],
    description: "Wrap yourself in plush warmth with this Cozy Fleece Printed Double Bed Blanket. Crafted from ultra-soft fleece in a striking black printed finish, its generous 89x90 inch dimensions comfortably cover a full double bed while staying lightweight and easy to care for throughout the winter season.",
    imageKey: "blanket_printed_black",
    inStock: true,
    stockQuantity: 25
  },
  {
    id: "blanket_fleece_navy_white",
    name: "Fleece Printed Double Bed Blanket Navy White",
    pricePkr: 1949,
    category: "BLANKETS",
    fabric: "Fleece",
    size: "Double Bed, 88x90 inches",
    shortSpec: "Double Bed • 88x90 in • Fleece • Blue",
    specs: [
      { label: "Bed Size", value: "Double Bed" },
      { label: "Dimensions", value: "88x90 inches" },
      { label: "Fabric", value: "Fleece" },
      { label: "Pattern", value: "Printed" },
      { label: "Color", value: "Blue" }
    ],
    description: "Designed for crisp comfort and timeless bedroom style, the Fleece Printed Double Bed Blanket in Navy White pairs a rich blue and crisp white print with soft insulating fleece. Sized at 88x90 inches for double beds, it delivers cozy warmth without heavy bulk.",
    imageKey: "blanket_navy_white",
    inStock: true,
    stockQuantity: 22
  },
  {
    id: "blanket_stylish_plain_blue",
    name: "Stylish Fleece Plain Double Bed Blanket",
    pricePkr: 2599,
    category: "BLANKETS",
    fabric: "Fleece",
    size: "Double Bed, 89x90 inches",
    shortSpec: "Double Bed • 89x90 in • Fleece • Plain Blue",
    specs: [
      { label: "Bed Size", value: "Double Bed" },
      { label: "Dimensions", value: "89x90 inches" },
      { label: "Fabric", value: "Fleece" },
      { label: "Style", value: "Plain" },
      { label: "Color", value: "Blue" }
    ],
    description: "Elevate your winter bedding with the Stylish Fleece Plain Double Bed Blanket. Tailored in a refined solid blue shade from dense velvety fleece (89x90 inches), it offers smooth drape, lasting softness, and dependable warmth for chilly nights across Pakistan.",
    imageKey: "blanket_plain_blue",
    inStock: true,
    stockQuantity: 18
  },
  {
    id: "blanket_3d_embossed_red",
    name: "3D Panel Fleece Embossed Double Bed Blanket",
    pricePkr: 3599,
    category: "BLANKETS",
    fabric: "Fleece",
    size: "Double Bed, 90 inches",
    shortSpec: "Double Bed • 90 in • 3D Embossed • Red",
    specs: [
      { label: "Bed Size", value: "Double Bed" },
      { label: "Size", value: "90 inches" },
      { label: "Fabric", value: "Fleece" },
      { label: "Finish", value: "Embossed (3D Panel)" },
      { label: "Color", value: "Red" }
    ],
    description: "Make a bold, luxurious statement in your bedroom with our 3D Panel Fleece Embossed Double Bed Blanket. Featuring deeply sculpted embossed relief panels in rich red fleece at a generous 90-inch double bed size, it combines plush thermal comfort with premium heirloom texture.",
    imageKey: "blanket_embossed_red",
    inStock: true,
    stockQuantity: 14
  },
  {
    id: "suit_boski_plain",
    name: "Men's Unstitched Boski Plain Suit",
    pricePkr: 1999,
    category: "MENS_SUITS",
    fabric: "Boski fabric",
    size: "Unstitched",
    shortSpec: "Unstitched • Boski Fabric • Plain",
    specs: [
      { label: "Type", value: "Unstitched" },
      { label: "Fabric", value: "Boski fabric" },
      { label: "Style", value: "Plain" }
    ],
    description: "Classic Pakistani elegance begins with our Men's Unstitched Boski Plain Suit. Woven with the signature smooth sheen and graceful fall of Boski fabric, this plain unstitched suit is ideal for formal gatherings, Eid wear, and effortless tailored shalwar kameez craftsmanship.",
    imageKey: "suit_boski",
    inStock: true,
    stockQuantity: 30
  },
  {
    id: "suit_wool_plain_brown",
    name: "Men's Unstitched Wool Plain Suit",
    pricePkr: 2299,
    category: "MENS_SUITS",
    fabric: "Wool",
    size: "Unstitched, 4 meter cutting",
    shortSpec: "Unstitched • Wool • Brown • 4m Cutting",
    specs: [
      { label: "Type", value: "Unstitched" },
      { label: "Fabric", value: "Wool" },
      { label: "Style", value: "Plain" },
      { label: "Color", value: "Brown" },
      { label: "Cutting", value: "4 meter cutting" }
    ],
    description: "Stay warm and sharp through winter with the Men's Unstitched Wool Plain Suit in rich brown. Supplied in a full 4 meter cutting of soft, insulating plain wool suiting, it tailors cleanly into a structured, dignified winter shalwar kameez or waistcoat ensemble.",
    imageKey: "suit_wool_brown",
    inStock: true,
    stockQuantity: 20
  },
  {
    id: "suit_wash_and_wear_blue",
    name: "Men's Unstitched Wash And Wear Plain Suit",
    pricePkr: 2999,
    category: "MENS_SUITS",
    fabric: "Wash and Wear",
    size: "Unstitched, 4 meter cutting",
    shortSpec: "Unstitched • Wash and Wear • Blue • 4m",
    specs: [
      { label: "Type", value: "Unstitched" },
      { label: "Fabric", value: "Wash and Wear" },
      { label: "Style", value: "Plain" },
      { label: "Color", value: "Blue" },
      { label: "Cutting", value: "4 meter cutting" }
    ],
    description: "Engineered for everyday polish with minimal ironing, the Men's Unstitched Wash And Wear Plain Suit in deep blue offers crisp drape and crease resistance from morning to evening. Includes a generous 4 meter cutting ready for custom stitching.",
    imageKey: "suit_washwear_blue",
    inStock: true,
    stockQuantity: 24
  },
  {
    id: "suit_cotton_plain",
    name: "Men's Unstitched Cotton Plain Suit",
    pricePkr: 3099,
    category: "MENS_SUITS",
    fabric: "Cotton",
    size: "Unstitched, 4.5 meter cutting",
    shortSpec: "Unstitched • Cotton • Plain • 4.5m Cutting",
    specs: [
      { label: "Type", value: "Unstitched" },
      { label: "Fabric", value: "Cotton" },
      { label: "Style", value: "Plain" },
      { label: "Cutting", value: "4.5 meter cutting" }
    ],
    description: "Breathable, crisp, and tailored for all-day comfort, our Men's Unstitched Cotton Plain Suit features premium natural cotton fabric in an extra-generous 4.5 meter cutting. Ideal for bespoke shalwar kameez stitching with clean structure and soft skin feel.",
    imageKey: "suit_cotton",
    inStock: true,
    stockQuantity: 16
  }
];

export const POPULAR_CITIES = [
  "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Sialkot"
];

let db = null;
let auth = null;
let isCloudLive = false;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (e) {
  console.warn("Firebase initialization warning:", e);
}

export function onAuth(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      await loadCloudCartOnLogin(user.uid);
    }
    callback(user);
  });
}

export async function logInWithEmail(email, password) {
  if (!auth) throw new Error("Auth not initialized");
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(email, password, name, phone) {
  if (!auth) throw new Error("Auth not initialized");
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const user = cred.user;
  if (db) {
    try {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: name,
        phone: phone,
        email: email,
        addresses: [],
        createdAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn("Failed to create user profile doc:", e);
    }
  }
  return cred;
}

export async function logInWithGoogle() {
  if (!auth) throw new Error("Auth not initialized");
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  const user = cred.user;
  if (db) {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName || "Customer",
          phone: user.phoneNumber || "",
          email: user.email,
          addresses: [],
          createdAt: serverTimestamp()
        });
      }
    } catch (e) {
      console.warn("Failed to ensure Google user profile:", e);
    }
  }
  return cred;
}

export async function logOut() {
  if (!auth) return;
  return await signOut(auth);
}

export function formatAuthError(err) {
  const code = err.code || "";
  const msg = err.message || "";
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return "Invalid email or password. Please check your credentials and try again.";
  }
  if (code === 'auth/email-already-in-use') {
    return "An account with this email address already exists. Please log in instead.";
  }
  if (code === 'auth/weak-password') {
    return "Password is too weak. Please use at least 6 characters.";
  }
  if (code === 'auth/invalid-email') {
    return "Please enter a valid email address.";
  }
  if (code === 'auth/popup-closed-by-user') {
    return "Google sign-in was cancelled.";
  }
  return msg || "An authentication error occurred. Please try again.";
}

export async function getUserProfile(uid) {
  if (!db) return null;
  try {
    const docRef = doc(db, "users", uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (e) {
    console.warn("Failed to get user profile:", e);
    return null;
  }
}

export async function updateUserProfile(uid, data) {
  if (!db) return;
  try {
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, data, { merge: true });
  } catch (e) {
    console.warn("Failed to update user profile:", e);
    throw e;
  }
}

export async function getUserOrders(uid) {
  if (!db) return [];
  try {
    const q = query(collection(db, "orders"), where("userId", "==", uid));
    const snap = await getDocs(q);
    const orders = [];
    snap.forEach(d => {
      orders.push({ id: d.id, ...d.data() });
    });
    orders.sort((a, b) => {
      const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.timestamp ? new Date(a.timestamp).getTime() : 0);
      const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.timestamp ? new Date(b.timestamp).getTime() : 0);
      return timeB - timeA;
    });
    return orders;
  } catch (e) {
    console.warn("Failed to get user orders:", e);
    return [];
  }
}

export function setupHeaderAuth() {
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;

  let authContainer = document.getElementById('header-auth-container');
  if (!authContainer) {
    authContainer = document.createElement('div');
    authContainer.id = 'header-auth-container';
    authContainer.style.display = 'inline-flex';
    authContainer.style.alignItems = 'center';
    authContainer.style.gap = '8px';
    const cartBtn = navActions.querySelector('#open-cart-btn');
    if (cartBtn) {
      navActions.insertBefore(authContainer, cartBtn);
    } else {
      navActions.appendChild(authContainer);
    }
  }

  onAuth(async (user) => {
    if (!user) {
      authContainer.innerHTML = `
        <a href="auth.html" class="btn-secondary" style="font-size: 0.9rem; text-decoration: none;">Log In</a>
      `;
    } else {
      let displayName = user.displayName || user.email;
      try {
        const profile = await getUserProfile(user.uid);
        if (profile && profile.displayName) {
          displayName = profile.displayName;
        }
      } catch (e) {}

      authContainer.innerHTML = `
        <a href="account.html" class="btn-secondary" style="font-size: 0.9rem; text-decoration: none; display: flex; align-items: center; gap: 4px;">
          <span>👤</span> <span>${displayName}</span>
        </a>
        <button id="header-logout-btn" class="btn-secondary" style="font-size: 0.85rem; padding: 6px 10px; color: var(--error); border-color: var(--error);">Log Out</button>
      `;

      const logoutBtn = document.getElementById('header-logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
          await logOut();
          window.location.reload();
        });
      }
    }
  });
}

export function formatPkr(amount) {
  return "Rs " + Number(amount).toLocaleString('en-US');
}

export function getImageSrc(product) {
  if (product.imageUri) return product.imageUri;
  const map = {
    'blanket_printed_black': 'images/img_blanket_printed_black_1795368929423.jpg',
    'blanket_navy_white': 'images/img_blanket_navy_white_1795368929031.jpg',
    'blanket_plain_blue': 'images/img_blanket_plain_blue_1795368928571.jpg',
    'blanket_embossed_red': 'images/img_blanket_embossed_red_1795368929457.jpg',
    'suit_boski': 'images/img_suit_boski_1795368943150.jpg',
    'suit_wool_brown': 'images/img_suit_wool_brown_1795368944258.jpg',
    'suit_washwear_blue': 'images/img_suit_washwear_blue_1795368945567.jpg',
    'suit_cotton': 'images/img_suit_cotton_1795368945913.jpg'
  };
  return map[product.imageKey] || 'images/img_blanket_plain_blue_1795368928571.jpg';
}

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem('gharbazar_cart')) || [];
  } catch (e) {
    return [];
  }
}

export async function loadCloudCartOnLogin(uid) {
  if (!db) return;
  try {
    const cartRef = doc(db, "carts", uid);
    const cartSnap = await getDoc(cartRef);
    const localCart = getCart();

    if (cartSnap.exists()) {
      const cloudItems = cartSnap.data().items || [];
      const mergedMap = new Map();
      cloudItems.forEach(item => mergedMap.set(item.product.id, { ...item }));
      localCart.forEach(item => {
        if (mergedMap.has(item.product.id)) {
          mergedMap.get(item.product.id).quantity += item.quantity;
        } else {
          mergedMap.set(item.product.id, { ...item });
        }
      });
      const mergedCart = Array.from(mergedMap.values());
      localStorage.setItem('gharbazar_cart', JSON.stringify(mergedCart));
      await setDoc(cartRef, { items: mergedCart, updatedAt: serverTimestamp() }, { merge: true });
      updateCartBadge();
    } else if (localCart.length > 0) {
      await setDoc(cartRef, { items: localCart, updatedAt: serverTimestamp() });
    }
  } catch (e) {
    console.warn("Failed to load cloud cart on login:", e);
  }
}

export function saveCart(cart) {
  localStorage.setItem('gharbazar_cart', JSON.stringify(cart));
  updateCartBadge();
  if (db && auth && auth.currentUser) {
    const uid = auth.currentUser.uid;
    setDoc(doc(db, "carts", uid), { items: cart, updatedAt: serverTimestamp() }, { merge: true }).catch(e => {
      console.warn("Failed to sync cart to cloud:", e);
    });
  }
}

export function addToCart(product, quantity = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.product.id === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }
  saveCart(cart);
}

export function updateCartQty(productId, delta) {
  const cart = getCart();
  const index = cart.findIndex(item => item.product.id === productId);
  if (index !== -1) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
  }
  saveCart(cart);
}

export function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.product.id !== productId);
  saveCart(cart);
}

export function getCartItemCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotalPkr() {
  return getCart().reduce((sum, item) => sum + (item.product.pricePkr * item.quantity), 0);
}

export function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (badge) {
    const count = getCartItemCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

export function subscribeProducts(onProductsLoaded) {
  if (!db) {
    onProductsLoaded(BUILT_IN_PRODUCTS, false, "Firestore unconfigured. Using built-in 8-product catalogue.");
    return;
  }

  try {
    const colRef = collection(db, "products");
    onSnapshot(colRef, (snapshot) => {
      if (snapshot.empty) {
        onProductsLoaded(BUILT_IN_PRODUCTS, false, "Cloud 'products' collection is empty — displaying built-in 8-product catalogue.");
      } else {
        const products = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          products.push({
            id: docSnap.id,
            name: data.name || "Product",
            pricePkr: Number(data.pricePkr) || 1999,
            category: data.category || "BLANKETS",
            fabric: data.fabric || "Standard",
            size: data.size || "Standard",
            shortSpec: data.shortSpec || "",
            specs: data.specs || [],
            description: data.description || "",
            imageKey: data.imageKey || "blanket_plain_blue",
            imageUri: data.imageUri || null,
            inStock: data.inStock !== false,
            stockQuantity: Number(data.stockQuantity) || 20
          });
        });
        isCloudLive = true;
        onProductsLoaded(products, true, "Live Connected to Cloud Firestore (project gharbazar-d8f79).");
      }
    }, (error) => {
      console.warn("Firestore listener error, falling back:", error);
      onProductsLoaded(BUILT_IN_PRODUCTS, false, "Cloud unreachable (" + error.message + "). Using built-in 8-product fallback catalogue.");
    });
  } catch (e) {
    console.warn("Firestore subscribe exception:", e);
    onProductsLoaded(BUILT_IN_PRODUCTS, false, "Using built-in 8-product catalogue fallback.");
  }
}

export async function placeOrder(orderData, callback) {
  const orderNumber = "GB-" + Math.floor(100000 + Math.random() * 900000);
  const uid = auth && auth.currentUser ? auth.currentUser.uid : null;

  const fullOrder = {
    orderNumber,
    customerName: orderData.customerName,
    phoneNumber: orderData.phoneNumber,
    deliveryAddress: orderData.deliveryAddress,
    city: orderData.city,
    items: getCart(),
    totalPkr: getCartTotalPkr(),
    userId: uid,
    status: "placed",
    createdAt: serverTimestamp ? serverTimestamp() : new Date(),
    timestamp: new Date().toISOString()
  };

  localStorage.setItem('gharbazar_last_order', JSON.stringify({
    ...fullOrder,
    createdAt: new Date().toISOString(),
    timestamp: new Date().toISOString()
  }));

  localStorage.removeItem('gharbazar_cart');
  updateCartBadge();

  if (uid && db) {
    try {
      await setDoc(doc(db, "carts", uid), { items: [], updatedAt: serverTimestamp() });
    } catch (e) {
      console.warn("Failed to clear cloud cart:", e);
    }
  }

  if (db) {
    try {
      await addDoc(collection(db, "orders"), {
        ...fullOrder,
        createdAt: serverTimestamp()
      });
      console.log("Order successfully written to Firestore 'orders'");
    } catch (e) {
      console.warn("Failed to write order to Firestore (saved locally):", e);
    }
  }

  if (callback) callback(orderNumber);
}

export async function adminGetProducts() {
  if (!db) return BUILT_IN_PRODUCTS;
  try {
    const snap = await getDocs(collection(db, "products"));
    if (snap.empty) return BUILT_IN_PRODUCTS;
    const products = [];
    snap.forEach(d => {
      const data = d.data();
      products.push({
        id: d.id,
        name: data.name || "Product",
        pricePkr: Number(data.pricePkr) || 1999,
        category: data.category || "BLANKETS",
        fabric: data.fabric || "Standard",
        size: data.size || "Standard",
        shortSpec: data.shortSpec || "",
        specs: data.specs || [],
        description: data.description || "",
        imageKey: data.imageKey || "blanket_plain_blue",
        imageUri: data.imageUri || null,
        inStock: data.inStock !== false,
        stockQuantity: Number(data.stockQuantity) || 20
      });
    });
    return products;
  } catch (e) {
    console.warn("Failed to admin get products:", e);
    return BUILT_IN_PRODUCTS;
  }
}

export async function adminSaveProduct(product) {
  if (!db) throw new Error("Firestore unconfigured");
  const prodId = product.id || ("prod_" + Date.now());
  const prodData = {
    name: product.name,
    pricePkr: Number(product.pricePkr),
    category: product.category,
    fabric: product.fabric || "",
    size: product.size || "",
    shortSpec: product.shortSpec || "",
    specs: product.specs || [],
    description: product.description || "",
    imageKey: product.imageKey || "blanket_plain_blue",
    imageUri: product.imageUri || null,
    inStock: product.inStock !== false,
    stockQuantity: Number(product.stockQuantity) || 20,
    updatedAt: serverTimestamp()
  };
  await setDoc(doc(db, "products", prodId), prodData, { merge: true });
  return prodId;
}

export async function adminDeleteProduct(id) {
  if (!db) throw new Error("Firestore unconfigured");
  await deleteDoc(doc(db, "products", id));
}

export async function adminGetAllOrders() {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, "orders"));
    const orders = [];
    snap.forEach(d => {
      orders.push({ id: d.id, ...d.data() });
    });
    orders.sort((a, b) => {
      const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.timestamp ? new Date(a.timestamp).getTime() : 0);
      const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.timestamp ? new Date(b.timestamp).getTime() : 0);
      return timeB - timeA;
    });
    return orders;
  } catch (e) {
    console.warn("Failed to admin get orders:", e);
    return [];
  }
}

export async function adminUpdateOrderStatus(orderId, status) {
  if (!db) throw new Error("Firestore unconfigured");
  await setDoc(doc(db, "orders", orderId), { status, updatedAt: serverTimestamp() }, { merge: true });
}

export async function seedProductsToFirestore() {
  if (!db) throw new Error("Firestore unconfigured");
  const snap = await getDocs(collection(db, "products"));
  if (!snap.empty) {
    throw new Error("Products collection is not empty. Seeding skipped.");
  }
  for (const p of BUILT_IN_PRODUCTS) {
    const { id, ...data } = p;
    await setDoc(doc(db, "products", id), {
      ...data,
      createdAt: serverTimestamp()
    });
  }
}

export function setupCartDrawer() {
  const existingModal = document.getElementById('cart-modal');
  if (existingModal) return;

  const modalHtml = `
    <div id="cart-modal" class="modal-overlay">
      <div class="cart-drawer">
        <div class="cart-header">
          <h3>Shopping Cart (<span id="cart-drawer-count">0</span>)</h3>
          <button class="close-btn" id="close-cart">&times;</button>
        </div>
        <div class="cart-body" id="cart-drawer-items">
          <!-- Cart Items injected here -->
        </div>
        <div class="cart-footer">
          <div class="cart-total-row">
            <span>Total:</span>
            <span id="cart-drawer-total" style="color: var(--primary);">Rs 0</span>
          </div>
          <button class="btn-primary" id="checkout-btn" style="width:100%; padding: 14px; font-size: 1rem;">
            Proceed to Checkout (COD)
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  document.getElementById('close-cart').addEventListener('click', toggleCartModal);
  document.getElementById('cart-modal').addEventListener('click', (e) => {
    if (e.target.id === 'cart-modal') toggleCartModal();
  });

  document.getElementById('checkout-btn').addEventListener('click', () => {
    if (getCart().length === 0) {
      alert("Your cart is empty.");
      return;
    }
    window.location.href = 'checkout.html';
  });
}

export function toggleCartModal() {
  const modal = document.getElementById('cart-modal');
  if (!modal) return;
  modal.classList.toggle('open');
  if (modal.classList.contains('open')) {
    renderCartDrawerContent();
  }
}

export function renderCartDrawerContent() {
  const container = document.getElementById('cart-drawer-items');
  const countSpan = document.getElementById('cart-drawer-count');
  const totalSpan = document.getElementById('cart-drawer-total');
  if (!container) return;

  const cart = getCart();
  countSpan.textContent = getCartItemCount();
  totalSpan.textContent = formatPkr(getCartTotalPkr());

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--on-surface-variant);">
        <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 8px;">Your cart is empty</p>
        <p style="font-size: 0.9rem;">Add cozy blankets or men's suits to get started!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${getImageSrc(item.product)}" alt="${item.product.name}" class="cart-item-img">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.product.name}</div>
        <div class="cart-item-price">${formatPkr(item.product.pricePkr)}</div>
        <div class="cart-item-controls">
          <button class="cart-item-qty-btn" onclick="window.gbDecreaseQty('${item.product.id}')">-</button>
          <span style="font-size: 0.9rem; font-weight: 600;">${item.quantity}</span>
          <button class="cart-item-qty-btn" onclick="window.gbIncreaseQty('${item.product.id}')">+</button>
          <button class="cart-item-remove" onclick="window.gbRemoveItem('${item.product.id}')">Remove</button>
        </div>
      </div>
    </div>
  `).join('');
}

window.gbIncreaseQty = (id) => {
  updateCartQty(id, 1);
  renderCartDrawerContent();
};

window.gbDecreaseQty = (id) => {
  updateCartQty(id, -1);
  renderCartDrawerContent();
};

window.gbRemoveItem = (id) => {
  removeFromCart(id);
  renderCartDrawerContent();
};
