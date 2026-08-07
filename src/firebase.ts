import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  getFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Detect whether valid Firebase configuration has been provided
export const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.apiKey.trim().length > 0);

// Initialize Firebase lazily or safely
let app;
let dbInstance: any = null;
let authInstance: any = null;

if (isFirebaseConfigured) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    // Bind to custom database ID with local persistent cache to prevent offline connection blocks
    try {
      dbInstance = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        }),
        experimentalForceLongPolling: true
      }, firebaseConfig.firestoreDatabaseId || "(default)");
    } catch (cacheErr) {
      console.warn("Could not initialize persistent cache Firestore, falling back to standard getFirestore:", cacheErr);
      dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
    }
    authInstance = getAuth(app);
  } catch (error) {
    console.warn("Failed to initialize live Firebase, running in fallback mode:", error);
  }
}

export const db = dbInstance;
export const auth = authInstance;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentAuthUser = authInstance?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuthUser?.uid || null,
      email: currentAuthUser?.email || null,
      emailVerified: currentAuthUser?.emailVerified || null,
      isAnonymous: currentAuthUser?.isAnonymous || null,
      tenantId: currentAuthUser?.tenantId || null,
      providerInfo: currentAuthUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  const serializedError = JSON.stringify(errInfo);
  console.warn('Firestore Error Occurred: ', serializedError);
  throw new Error(serializedError);
}

// Function to test connection as mandatorily requested in the Firebase Integration Guide
export async function testConnection() {
  if (!isFirebaseConfigured || !db) return;
  
  // Dynamic import to avoid SSR hurdles or mock environments
  try {
    const { doc, getDocFromServer } = await import('firebase/firestore');
    
    // Race connection check with a fast-fail 2-second timeout promise
    let timeoutId: any;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Connection check timed out (2s limit exceeded)'));
      }, 2000);
    });

    await Promise.race([
      getDocFromServer(doc(db, 'test', 'connection')).then((val) => {
        clearTimeout(timeoutId);
        return val;
      }),
      timeoutPromise
    ]);
    console.log("Firebase Connection verified successfully.");
  } catch (error) {
    console.warn("Firebase is running in offline/serverless mode (safe local storage caching is active):", error instanceof Error ? error.message : error);
  }
}

// Invoke connection verification
if (isFirebaseConfigured && db) {
  testConnection();
}
