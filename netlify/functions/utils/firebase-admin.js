import admin from 'firebase-admin';

// Inicializar Firebase Admin
if (!admin.apps.length) {
    try {
        console.log('🔥 Initializing Firebase Admin...');
        console.log('📧 Client Email exists:', !!process.env.FIREBASE_CLIENT_EMAIL);
        console.log('🔑 Private Key exists:', !!process.env.FIREBASE_PRIVATE_KEY);
        console.log('🆔 Project ID:', process.env.FIREBASE_PROJECT_ID);

        let privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (privateKey) {
            // Remove surrounding quotes if present
            if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
                privateKey = privateKey.slice(1, -1);
            }
            // Replace literal \n with actual newlines
            privateKey = privateKey.replace(/\\n/g, '\n');
        }

        if (!process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
            throw new Error('Missing Firebase Admin credentials (FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY)');
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        });
        console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
        console.error('❌ Firebase Admin initialization error:', error);
        throw error; // Re-throw to prevent using uninitialized app
    }
}

const db = admin.firestore();

export const COLLECTIONS = {
    USERS: 'users',
    POSTS: 'posts',
    NEWSLETTER: 'newsletter',
    CONTACTS: 'contacts'
};

export function getDb() {
    return db;
}

export { admin };
