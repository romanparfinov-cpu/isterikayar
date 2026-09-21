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
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  serverTimestamp,
  onSnapshot,
  Firestore
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { Product, AppUser, Order, AppSettings, BlogPost } from '../types';
import firebaseAppletConfig from '../../firebase-applet-config.json';
import { INITIAL_PRODUCTS, INITIAL_BLOG_POSTS } from '../data/initialProducts';

// Configuration supporting both auto-provisioned config and custom environment variables
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey || "AIzaSyBevq3NApdPxvv4nY-rOTW-nQTPTTSpFjg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain || "abstract-parser-n6shk.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId || "abstract-parser-n6shk",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket || "abstract-parser-n6shk.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId || "500286417908",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId || "1:500286417908:web:1d619e2a9420da94e467a1",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseAppletConfig.measurementId || "",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseAppletConfig.firestoreDatabaseId || 'ai-studio-isterika-94f58454-06d4-4509-83e6-3eef6fe198cd'
};

export const ADMIN_EMAIL = 'romanparfinov@gmail.com';

const STORAGE_PRODUCTS_KEY = 'isterika_products_v2';
const STORAGE_SUBSCRIBERS_KEY = 'isterika_subscribers_v1';
const STORAGE_ORDERS_KEY = 'isterika_orders_v1';
const STORAGE_SETTINGS_KEY = 'isterika_settings_v1';
const STORAGE_BLOGS_KEY = 'isterika_blogs_v1';

const DEFAULT_SETTINGS: AppSettings = {
  telegramUsername: 'isterikaMngr'
};

// Safe timeout wrapper for Firestore write operations to prevent infinite hanging
async function withFirestoreTimeout<T>(operation: Promise<T>, timeoutMs = 3500): Promise<T> {
  return Promise.race([
    operation,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Firestore operation timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
}

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
  
  // Use initializeFirestore with local persistent cache and multi-tab sync
  try {
    const firestoreSettings = {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      }),
      experimentalAutoDetectLongPolling: true
    };
    db = customDbId 
      ? initializeFirestore(app, firestoreSettings, customDbId) 
      : initializeFirestore(app, firestoreSettings);
  } catch {
    // If already initialized, fallback to getFirestore
    db = customDbId ? getFirestore(app, customDbId) : getFirestore(app);
  }
  
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

function parseFirestoreValue(v: any): any {
  if (v === undefined || v === null) return null;
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.integerValue !== undefined) return parseInt(v.integerValue, 10);
  if (v.doubleValue !== undefined) return parseFloat(v.doubleValue);
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.timestampValue !== undefined) return v.timestampValue;
  if (v.mapValue !== undefined) {
    const obj: any = {};
    for (const [mk, mv] of Object.entries<any>(v.mapValue.fields || {})) {
      obj[mk] = parseFirestoreValue(mv);
    }
    return obj;
  }
  if (v.arrayValue !== undefined) {
    return (v.arrayValue.values || []).map(parseFirestoreValue);
  }
  return null;
}

// Products API (Real Firestore + Fast REST Fallback)
export async function fetchProductsFromRest(): Promise<Product[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const dbName = firebaseConfig.firestoreDatabaseId || '(default)';
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${dbName}/documents/products`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.documents || !Array.isArray(data.documents)) return [];
    
    const list: Product[] = data.documents.map((d: any) => {
      const fields = d.fields || {};
      const parts = d.name.split('/');
      const id = parts[parts.length - 1];
      const p: any = { id };
      for (const [k, v] of Object.entries<any>(fields)) {
        p[k] = parseFirestoreValue(v);
      }
      return p as Product;
    });

    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return list;
  } catch (err) {
    console.warn('REST fetch fallback error:', err);
    return [];
  }
}

export function subscribeToProducts(callback: (products: Product[]) => void): () => void {
  // 1. Immediately provide cached/initial products (zero-delay on any device/Safari)
  const cached = getLocalProducts();
  if (cached && cached.length > 0) {
    callback(cached);
  }

  // 2. Fetch fresh data via fast REST API (bypasses Safari Incognito WebSocket blocking)
  fetchProductsFromRest().then((restProds) => {
    if (restProds && restProds.length > 0) {
      saveLocalProducts(restProds);
      callback(restProds);
    }
  }).catch(() => {});

  if (!db) {
    return () => {};
  }

  // 3. Real-time subscription for live changes (admin edits, stock changes)
  const colRef = collection(db, 'products');
  const unsubscribe = onSnapshot(colRef, (snap) => {
    if (snap.empty) {
      return;
    }

    const list: Product[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as Product);
    });
    
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    saveLocalProducts(list);
    callback(list);
  }, (error) => {
    console.warn('Firestore subscription note (using cached/REST data):', error);
  });

  return unsubscribe;
}

export async function fetchProducts(): Promise<Product[]> {
  // First attempt fast REST (works reliably across Safari Incognito, mobile networks)
  try {
    const restList = await fetchProductsFromRest();
    if (restList && restList.length > 0) {
      saveLocalProducts(restList);
      return restList;
    }
  } catch {}

  // Fallback to Firestore SDK
  if (db) {
    try {
      const colRef = collection(db, 'products');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        const list: Product[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as Product);
        });
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        saveLocalProducts(list);
        return list;
      }
    } catch (e) {
      console.warn('Firestore fetch failed, returning cached products:', e);
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
      await withFirestoreTimeout(setDoc(doc(db, 'products', newId), newProduct), 3000);
    } catch (e) {
      console.warn('Firestore addProduct failed or timed out, storing locally:', e);
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
      await withFirestoreTimeout(
        setDoc(doc(db, 'products', product.id), { ...product }, { merge: true }),
        3000
      );
    } catch (e) {
      console.warn('Firestore updateProduct failed or timed out, storing locally:', e);
    }
  }

  const current = getLocalProducts();
  const index = current.findIndex(p => p.id === product.id);
  if (index !== -1) {
    current[index] = product;
    saveLocalProducts([...current]);
  } else {
    saveLocalProducts([product, ...current]);
  }
}

export async function deleteProductFromDB(productId: string): Promise<void> {
  if (db) {
    try {
      await withFirestoreTimeout(deleteDoc(doc(db, 'products', productId)), 3000);
    } catch (e) {
      console.warn('Firestore deleteProduct failed or timed out:', e);
    }
  }

  const current = getLocalProducts();
  const filtered = current.filter(p => p.id !== productId);
  saveLocalProducts(filtered);
}

// Settings API
export async function fetchSettings(): Promise<AppSettings> {
  let settings: AppSettings = { ...DEFAULT_SETTINGS };

  if (db) {
    try {
      const snap = await getDocs(collection(db, 'settings'));
      if (!snap.empty) {
        settings = { ...DEFAULT_SETTINGS, ...snap.docs[0].data() } as AppSettings;
      }
    } catch (e) {
      console.warn('Firestore fetchSettings failed:', e);
    }
  }
  
  if (!settings.telegramUsername || settings.telegramUsername === DEFAULT_SETTINGS.telegramUsername) {
    try {
      const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.telegramUsername) {
          settings.telegramUsername = parsed.telegramUsername;
        }
      }
    } catch {}
  }

  // Purge any old/stale usernames like istermanager or istertelegram
  const cleanUsername = (settings.telegramUsername || '').replace('@', '').trim();
  const lower = cleanUsername.toLowerCase();
  if (!cleanUsername || lower === 'istermanager' || lower === 'istertelegram' || lower.includes('istermanager') || lower.includes('istertelegram')) {
    settings.telegramUsername = 'isterikaMngr';
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
  }

  return settings;
}

export async function updateSettingsInDB(settings: AppSettings): Promise<void> {
  const cleanUsername = (settings.telegramUsername || '').replace('@', '').trim();
  const lower = cleanUsername.toLowerCase();
  if (!cleanUsername || lower === 'istermanager' || lower === 'istertelegram' || lower.includes('istermanager') || lower.includes('istertelegram')) {
    settings.telegramUsername = 'isterikaMngr';
  } else {
    settings.telegramUsername = cleanUsername;
  }

  if (db) {
    try {
      await withFirestoreTimeout(
        setDoc(doc(db, 'settings', 'global'), settings, { merge: true }),
        3000
      );
    } catch (e) {
      console.warn('Firestore updateSettings failed or timed out:', e);
    }
  }
  try {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
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
    const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
    const current = raw ? JSON.parse(raw) : [];
    const updated = [newOrder, ...(Array.isArray(current) ? current : [])];
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(updated));
  } catch {}
  return newOrder;
}

export async function deleteOrderFromDB(orderId: string): Promise<void> {
  if (db) {
    try {
      await withFirestoreTimeout(deleteDoc(doc(db, 'orders', orderId)), 3000);
    } catch (e) {
      console.warn('Firestore deleteOrder failed or timed out:', e);
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
      await withFirestoreTimeout(
        setDoc(doc(db, 'orders', orderId), { status }, { merge: true }),
        3000
      );
    } catch (e) {
      console.warn('Firestore updateOrderStatus failed or timed out:', e);
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
      
      const uploadPromise = uploadBytes(storageRef, file);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Firebase Storage timeout')), 7000)
      );
      
      const uploadRes = await Promise.race([uploadPromise, timeoutPromise]) as any;
      return await getDownloadURL(uploadRes.ref);
    } catch (e) {
      console.warn('Firebase storage upload failed or timed out, converting to dataURL:', e);
    }
  }

  // Fallback to compressed base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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
      await withFirestoreTimeout(setDoc(doc(db, 'blog_posts', newId), newPost), 3000);
    } catch (e) {
      console.warn('Firestore addBlogPost failed or timed out:', e);
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
      await withFirestoreTimeout(
        setDoc(doc(db, 'blog_posts', id), post, { merge: true }),
        3000
      );
    } catch (e) {
      console.warn('Firestore updateBlogPost failed or timed out:', e);
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
      await withFirestoreTimeout(deleteDoc(doc(db, 'blog_posts', id)), 3000);
    } catch (e) {
      console.warn('Firestore deleteBlogPost failed or timed out:', e);
    }
  }

  try {
    const current = await fetchBlogPosts();
    const updated = current.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_BLOGS_KEY, JSON.stringify(updated));
  } catch {}
}
