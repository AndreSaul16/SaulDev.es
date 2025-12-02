import { getDb, COLLECTIONS } from './utils/firebase.js';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
};

/**
 * Get all blog posts from Firestore
 * Ordered by creation date (most recent first)
 */
export const handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const db = getDb();
        const postsRef = collection(db, COLLECTIONS.POSTS);

        // Get all posts ordered by creation date
        const q = query(postsRef, orderBy('createdAt', 'desc'));
        const postsSnapshot = await getDocs(q);

        const posts = postsSnapshot.docs.map(doc => doc.data());

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ posts }),
        };

    } catch (error) {
        console.error('Error in get-posts:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
