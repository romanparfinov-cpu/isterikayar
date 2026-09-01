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
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { Product, AppUser, Order, AppSettings, BlogPost } from '../types';
import { INITIAL_PRODUCTS, INITIAL_BLOG_POSTS } from '../data/initialProducts';

// Configuration supporting both auto-provisioned config and custom Vercel environment variables
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyByOxuteEKwId8W85KLLn_gStv5ObV2zWM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "isterikaai.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://isterikaai-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "isterikaai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "isterikaai.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "285709727430",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:285709727430:web:05542c9dbc2470d4b309c7",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-9L6R6RMX2G",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '(default)'
};

export const ADMIN_EMAIL = 'romanparfinov@gmail.com';

const STORAGE_PRODUCTS_KEY = 'isterika_products_v2';
const STORAGE_SUBSCRIBERS_KEY = 'isterika_subscribers_v1';
const STORAGE_ORDERS_KEY = 'isterika_orders_v1';
const STORAGE_SETTINGS_KEY = 'isterika_settings_v1';
const STORAGE_BLOGS_KEY = 'isterika_blogs_v1';

const DEFAULT_SETTINGS: AppSettings = {
  telegramUsername: 'ISTERTELEGRAM'
};

// Initialize Firebase
let app: any = null;
let auth: any = null;
let db: Firestore | null = null;
let storage: any = null;
let googleProvider: GoogleAuthProvider | null = null;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  
  const customDbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : undefined;
  
  db = customDbId ? getFirestore(app, customDbId) : getFirestore(app);
  storage = getStorage(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} catch (err) {
  console.warn('Firebase initialization note:', err);
}

// LocalStorage helpers for fast offline caching / fallback
export function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_PRODUCTS_KEY);
    if (!raw) return INITIAL_PRODUCTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveLocalProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
  } catch (err) {
    console.error('Error saving local products:', err);
  }
}

// Products API (Real Firestore)
export async function fetchProducts(): Promise<Product[]> {
  if (db) {
    try {
      const colRef = collection(db, 'products');
      const snap = await getDocs(colRef);
      if (snap.empty) {
        // Seed initial products to cloud Firestore
        for (const p of INITIAL_PRODUCTS) {
          try {
            await setDoc(doc(db, 'products', p.id), p);
          } catch (e) {
            console.warn('Seeding product failed:', e);
          }
        }
        saveLocalProducts(INITIAL_PRODUCTS);
        return INITIAL_PRODUCTS;
      }
      const list: Product[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Product);
      });
      saveLocalProducts(list);
      return list;
    } catch (e) {
      console.warn('Firestore fetch failed, returning cached products:', e);
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

  if (db) {
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
  if (db) {
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
  if (db) {
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
  if (db) {
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
  if (db) {
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
  if (db) {
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

  if (db) {
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
  if (db) {
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
  if (db) {
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

// Image upload to Firebase Storage or Base64 fallback
export async function uploadProductImage(file: File): Promise<string> {
  if (storage) {
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
  if (db) {
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

// Real Google Authentication
export async function loginWithGoogle(): Promise<AppUser> {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Auth не инициализирован');
  }

  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;
  const userEmail = (fbUser.email || '').toLowerCase().trim();
  const isAdmin = userEmail === ADMIN_EMAIL.toLowerCase().trim();

  const appUser: AppUser = {
    uid: fbUser.uid,
    email: fbUser.email,
    displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Пользователь',
    photoURL: fbUser.photoURL,
    isAdmin
  };

  // Sync user profile in Firestore
  if (db) {
    try {
      await setDoc(doc(db, 'users', fbUser.uid), {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: appUser.displayName,
        photoURL: appUser.photoURL,
        role: isAdmin ? 'admin' : 'user',
        isAdmin,
        lastLoginAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn('Could not save user profile to firestore:', e);
    }
  }

  return appUser;
}

export async function logoutUser(): Promise<void> {
  if (auth) {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Firebase signOut failed:', e);
    }
  }
}

export function subscribeToAuthState(callback: (user: AppUser | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
    if (fbUser) {
      const userEmail = (fbUser.email || '').toLowerCase().trim();
      const isAdmin = userEmail === ADMIN_EMAIL.toLowerCase().trim();

      callback({
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Пользователь',
        photoURL: fbUser.photoURL,
        isAdmin
      });
    } else {
      callback(null);
    }
  });
}

// Blog API
export async function fetchBlogPosts(): Promise<BlogPost[]> {
  if (db) {
    try {
      const colRef = collection(db, 'blog_posts');
      const snap = await getDocs(colRef);
      if (snap.empty) {
        for (const post of INITIAL_BLOG_POSTS) {
          try {
            await setDoc(doc(db, 'blog_posts', post.id), post);
          } catch (e) {
            console.warn('Error seeding blog:', e);
          }
        }
        return INITIAL_BLOG_POSTS;
      }
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
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_BLOG_POSTS;
    }
  } catch {}
  return INITIAL_BLOG_POSTS;
}

export async function addBlogPostToDB(post: Omit<BlogPost, 'id'>): Promise<BlogPost> {
  const newId = 'blog-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const newPost: BlogPost = {
    ...post,
    id: newId
  };

  if (db) {
    try {
      await setDoc(doc(db, 'blog_posts', newId), newPost);
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
  if (db) {
    try {
      await updateDoc(doc(db, 'blog_posts', id), post);
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
  if (db) {
    try {
      await deleteDoc(doc(db, 'blog_posts', id));
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
