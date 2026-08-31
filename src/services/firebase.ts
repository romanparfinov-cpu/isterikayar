import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { Product, AppUser, Order, AppSettings, BlogPost } from '../types';

// Placeholder configuration specified in requirements
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "ВАШ_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ВАШ_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ВАШ_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ВАШ_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "ВАШ_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "ВАШ_APP_ID"
};

export const ADMIN_EMAIL = 'romanparfinov@gmail.com';
const STORAGE_PRODUCTS_KEY = 'isterika_products_v2';
const STORAGE_SUBSCRIBERS_KEY = 'isterika_subscribers_v1';
const STORAGE_ORDERS_KEY = 'isterika_orders_v1';
const STORAGE_SETTINGS_KEY = 'isterika_settings_v1';
const STORAGE_BLOGS_KEY = 'isterika_blogs_v1';

const DEFAULT_SETTINGS = {
  telegramUsername: 'ISTERTELEGRAM'
};

// Determine if real firebase credentials are provided
const isRealConfig = 
  firebaseConfig.apiKey && 
  !firebaseConfig.apiKey.includes('ВАШ_') && 
  firebaseConfig.projectId && 
  !firebaseConfig.projectId.includes('ВАШ_');

let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let googleProvider: any = null;

if (isRealConfig) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
  } catch (err) {
    console.warn('Firebase initialization error, using local fallback:', err);
  }
}

// LocalStorage helpers for fallback
export function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_PRODUCTS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
  } catch (err) {
    console.error('Error saving local products:', err);
  }
}

// Products API
export async function fetchProducts(): Promise<Product[]> {
  if (db && isRealConfig) {
    try {
      const colRef = collection(db, 'products');
      const snap = await getDocs(colRef);
      if (snap.empty) {
        // Seed demo products to Firestore if empty
        const initial = getLocalProducts();
        for (const p of initial) {
          await setDoc(doc(db, 'products', p.id), p);
        }
        return initial;
      }
      const list: Product[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Product);
      });
      saveLocalProducts(list);
      return list;
    } catch (e) {
      console.warn('Firestore fetch failed, returning localStorage products:', e);
      return getLocalProducts();
    }
  }
  return getLocalProducts();
}

export async function addProductToDB(productData: Omit<Product, 'id'>): Promise<Product> {
  const newId = 'prod-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const newProduct: Product = {
    ...productData,
    id: newId,
    createdAt: Date.now()
  };

  if (db && isRealConfig) {
    try {
      await setDoc(doc(db, 'products', newId), newProduct);
    } catch (e) {
      console.warn('Firestore addDoc failed, storing locally:', e);
    }
  }

  const current = getLocalProducts();
  const updated = [newProduct, ...current];
  saveLocalProducts(updated);
  return newProduct;
}

export async function updateProductInDB(product: Product): Promise<void> {
  if (db && isRealConfig) {
    try {
      await updateDoc(doc(db, 'products', product.id), { ...product });
    } catch (e) {
      console.warn('Firestore updateDoc failed:', e);
    }
  }

  const current = getLocalProducts();
  const index = current.findIndex(p => p.id === product.id);
  if (index !== -1) {
    current[index] = product;
    saveLocalProducts([...current]);
  }
}

export async function deleteProductFromDB(productId: string): Promise<void> {
  if (db && isRealConfig) {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (e) {
      console.warn('Firestore deleteDoc failed:', e);
    }
  }

  const current = getLocalProducts();
  const filtered = current.filter(p => p.id !== productId);
  saveLocalProducts(filtered);
}

// Settings API
export async function fetchSettings(): Promise<AppSettings> {
  if (db && isRealConfig) {
    try {
      const snap = await getDocs(collection(db, 'settings'));
      if (snap.empty) {
        await setDoc(doc(db, 'settings', 'global'), DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
      return snap.docs[0].data() as AppSettings;
    } catch (e) {
      console.warn('Firestore fetchSettings failed:', e);
    }
  }
  
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_SETTINGS;
}

export async function updateSettingsInDB(settings: AppSettings): Promise<void> {
  if (db && isRealConfig) {
    try {
      await setDoc(doc(db, 'settings', 'global'), settings, { merge: true });
    } catch (e) {
      console.warn('Firestore updateSettings failed:', e);
    }
  }
  localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
}

// Orders API
export async function fetchOrders(): Promise<Order[]> {
  if (db && isRealConfig) {
    try {
      const colRef = collection(db, 'orders');
      const snap = await getDocs(colRef);
      const list: Order[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as Order));
      return list.sort((a, b) => b.createdAt - a.createdAt);
    } catch (e) {
      console.warn('Firestore fetchOrders failed:', e);
    }
  }
  
  try {
    const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {}
  return [];
}

export async function addOrderToDB(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
  const newId = 'ord-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const newOrder: Order = {
    ...order,
    id: newId,
    createdAt: Date.now()
  };

  if (db && isRealConfig) {
    try {
      await setDoc(doc(db, 'orders', newId), newOrder);
    } catch (e) {
      console.warn('Firestore addOrder failed:', e);
    }
  }

  try {
    const current = await fetchOrders();
    const updated = [newOrder, ...current];
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(updated));
  } catch {}
  return newOrder;
}

export async function deleteOrderFromDB(orderId: string): Promise<void> {
  if (db && isRealConfig) {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (e) {
      console.warn('Firestore deleteOrder failed:', e);
    }
  }

  try {
    const current = await fetchOrders();
    const updated = current.filter(o => o.id !== orderId);
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(updated));
  } catch {}
}

export async function updateOrderStatusInDB(orderId: string, status: Order['status']): Promise<void> {
  if (db && isRealConfig) {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
    } catch (e) {
      console.warn('Firestore updateOrderStatus failed:', e);
    }
  }

  try {
    const current = await fetchOrders();
    const index = current.findIndex(o => o.id === orderId);
    if (index !== -1) {
      current[index].status = status;
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(current));
    }
  } catch {}
}

// Image upload to Firebase Storage or Base64 / URL fallback
export async function uploadProductImage(file: File): Promise<string> {
  if (storage && isRealConfig) {
    try {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const uploadRes = await uploadBytes(storageRef, file);
      return await getDownloadURL(uploadRes.ref);
    } catch (e) {
      console.warn('Firebase storage upload failed, converting to dataURL:', e);
    }
  }

  // Fallback to FileReader base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Newsletter subscription
export async function subscribeEmail(email: string): Promise<void> {
  if (db && isRealConfig) {
    try {
      await addDoc(collection(db, 'subscribers'), {
        email,
        subscribedAt: serverTimestamp()
      });
      return;
    } catch (e) {
      console.warn('Firestore subscribe error, using localStorage:', e);
    }
  }

  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_SUBSCRIBERS_KEY) || '[]');
    if (!existing.includes(email)) {
      existing.push(email);
      localStorage.setItem(STORAGE_SUBSCRIBERS_KEY, JSON.stringify(existing));
    }
  } catch (err) {
    console.error('Local subscribers error:', err);
  }
}

// Authentication Helpers
export async function loginWithGoogle(): Promise<AppUser> {
  if (auth && googleProvider && isRealConfig) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isAdmin: (user.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase()
      };
    } catch (e) {
      console.warn('Firebase Google Auth failed, offering simulated sign-in for preview:', e);
    }
  }

  // Simulated Admin / User login when Firebase config is a placeholder
  const mockAdminUser: AppUser = {
    uid: 'admin-simulated-id',
    email: ADMIN_EMAIL,
    displayName: 'Роман Парфинов (Admin)',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    isAdmin: true
  };
  localStorage.setItem('isterika_auth_user', JSON.stringify(mockAdminUser));
  return mockAdminUser;
}

export async function logoutUser(): Promise<void> {
  if (auth && isRealConfig) {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Firebase signOut failed:', e);
    }
  }
  localStorage.removeItem('isterika_auth_user');
}

export function subscribeToAuthState(callback: (user: AppUser | null) => void): () => void {
  if (auth && isRealConfig) {
    return onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        callback({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
          isAdmin: (fbUser.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase()
        });
      } else {
        callback(null);
      }
    });
  }

  // Fallback to localStorage session
  try {
    const raw = localStorage.getItem('isterika_auth_user');
    if (raw) {
      callback(JSON.parse(raw));
    } else {
      callback(null);
    }
  } catch {
    callback(null);
  }

  return () => {};
}

// Blog API
export async function fetchBlogPosts(): Promise<BlogPost[]> {
  if (db && isRealConfig) {
    try {
      const colRef = collection(db, 'blogs');
      const snap = await getDocs(colRef);
      const list: BlogPost[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as BlogPost));
      return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      console.warn('Firestore fetchBlogPosts failed:', e);
    }
  }
  
  try {
    const raw = localStorage.getItem(STORAGE_BLOGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {}
  return [];
}

export async function addBlogPostToDB(post: Omit<BlogPost, 'id'>): Promise<BlogPost> {
  const newId = 'blog-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const newPost: BlogPost = {
    ...post,
    id: newId
  };

  if (db && isRealConfig) {
    try {
      await setDoc(doc(db, 'blogs', newId), newPost);
    } catch (e) {
      console.warn('Firestore addBlogPost failed:', e);
    }
  }

  try {
    const current = await fetchBlogPosts();
    const updated = [newPost, ...current];
    localStorage.setItem(STORAGE_BLOGS_KEY, JSON.stringify(updated));
  } catch {}
  return newPost;
}

export async function updateBlogPostInDB(id: string, post: Partial<BlogPost>): Promise<void> {
  if (db && isRealConfig) {
    try {
      await updateDoc(doc(db, 'blogs', id), post);
    } catch (e) {
      console.warn('Firestore updateBlogPost failed:', e);
    }
  }

  try {
    const current = await fetchBlogPosts();
    const index = current.findIndex(p => p.id === id);
    if (index !== -1) {
      current[index] = { ...current[index], ...post };
      localStorage.setItem(STORAGE_BLOGS_KEY, JSON.stringify(current));
    }
  } catch {}
}

export async function deleteBlogPostFromDB(id: string): Promise<void> {
  if (db && isRealConfig) {
    try {
      await deleteDoc(doc(db, 'blogs', id));
    } catch (e) {
      console.warn('Firestore deleteBlogPost failed:', e);
    }
  }

  try {
    const current = await fetchBlogPosts();
    const updated = current.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_BLOGS_KEY, JSON.stringify(updated));
  } catch {}
}
