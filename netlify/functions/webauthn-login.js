import {
    generateAuthenticationOptions,
    verifyAuthenticationResponse
} from '@simplewebauthn/server';
import { getDb, COLLECTIONS, admin } from './utils/firebase-admin.js';

const RP_ID = process.env.RP_ID || 'localhost';
const ORIGIN = process.env.ORIGIN || 'http://localhost:8888';

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
};

/**
 * Get user by email from Firestore
 */
async function getUser(email) {
    try {
        const db = getDb();
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(email).get();
        return userDoc.exists ? userDoc.data() : null;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}

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
        const { step, email, response } = JSON.parse(event.body);

        if (step === 'generate-options') {
            const user = await getUser(email);

            if (!user || !user.credentials || user.credentials.length === 0) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'User not found or no credentials registered' }),
                };
            }

            const options = await generateAuthenticationOptions({
                rpID: RP_ID,
                allowCredentials: user.credentials.map(cred => {
                    let credId;
                    if (typeof cred.credentialID === 'string') {
                        // Ensure it is Base64URL
                        credId = Buffer.from(cred.credentialID, 'base64').toString('base64url');
                    } else if (cred.credentialID.data) {
                        credId = Buffer.from(cred.credentialID.data).toString('base64url');
                    } else {
                        credId = cred.credentialID;
                    }

                    return {
                        id: credId,
                        type: 'public-key',
                        transports: cred.transports || ['internal', 'hybrid'],
                    };
                }),
                userVerification: 'preferred',
            });

            global.currentChallenge = options.challenge;
            global.currentEmail = email;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(options),
            };

        } else if (step === 'verify-authentication') {
            const expectedChallenge = global.currentChallenge;
            const expectedEmail = global.currentEmail;

            if (!expectedChallenge || !expectedEmail) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Challenge not found' }),
                };
            }

            const user = await getUser(expectedEmail);

            if (!user) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'User not found' }),
                };
            }

            const credential = user.credentials[0];
            const authenticator = {
                credentialID: Buffer.from(credential.credentialID, 'base64'),
                credentialPublicKey: Buffer.from(credential.credentialPublicKey, 'base64'),
                counter: credential.counter,
            };

            const verification = await verifyAuthenticationResponse({
                response,
                expectedChallenge,
                expectedOrigin: ORIGIN,
                expectedRPID: RP_ID,
                authenticator,
            });

            if (verification.verified) {
                delete global.currentChallenge;
                delete global.currentEmail;

                // Generar Custom Token de Firebase
                const customToken = await admin.auth().createCustomToken(expectedEmail);

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        verified: true,
                        token: customToken,
                        email: expectedEmail
                    }),
                };
            } else {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Verification failed' }),
                };
            }
        }

        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid step' }),
        };

    } catch (error) {
        console.error('Error in webauthn-login:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
