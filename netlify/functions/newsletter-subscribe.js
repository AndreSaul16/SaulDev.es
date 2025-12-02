import { getDb, COLLECTIONS } from './utils/firebase.js';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
};

export const handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { encrypted } = JSON.parse(event.body);

        if (!encrypted) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Encrypted email required' }),
            };
        }

        const db = getDb();
        const newsletterRef = collection(db, COLLECTIONS.NEWSLETTER);

        // Check if already subscribed
        const q = query(newsletterRef, where('encrypted', '==', encrypted));
        const existingSnapshot = await getDocs(q);

        if (!existingSnapshot.empty) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, message: 'Already subscribed' }),
            };
        }

        // Create new subscriber
        const subscriberData = {
            encrypted,
            subscribedAt: new Date().toISOString(),
        };

        await addDoc(newsletterRef, subscriberData);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true }),
        };

    } catch (error) {
        console.error('Error in newsletter-subscribe:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
