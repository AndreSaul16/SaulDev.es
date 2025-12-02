import {
    generateRegistrationOptions,
    verifyRegistrationResponse
} from '@simplewebauthn/server';
import { getDb, COLLECTIONS, admin } from './utils/firebase-admin.js';

const RP_NAME = 'SaulDev Portfolio';
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

/**
 * Save user to Firestore
 */
async function saveUser(email, credentials) {
    try {
        const db = getDb();
        const userData = {
            email,
            credentials,
            registeredAt: new Date().toISOString(),
        };

        await db.collection(COLLECTIONS.USERS).doc(email).set(userData);
        return true;
    } catch (error) {
        console.error('Error saving user:', error);
        throw error;
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
            const existingUser = await getUser(email);

            console.log('Existing user check:', { email, existingUser: !!existingUser });

            if (existingUser) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'User already exists' }),
                };
            }

            // Convert email to Uint8Array for userID (required by @simplewebauthn/server v9+)
            const userIDBuffer = new TextEncoder().encode(email);

            const options = await generateRegistrationOptions({
                rpName: RP_NAME,
                rpID: RP_ID,
                userID: userIDBuffer,
                userName: email,
                attestationType: 'none',
                authenticatorSelection: {
                    authenticatorAttachment: 'platform', // Force Windows Hello / Touch ID
                    residentKey: 'preferred',
                    userVerification: 'preferred',
                },
            });

            global.currentChallenge = options.challenge;

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(options),
            };

        } else if (step === 'verify-registration') {
            const expectedChallenge = global.currentChallenge;

            if (!expectedChallenge) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Challenge not found' }),
                };
            }

            const verification = await verifyRegistrationResponse({
                response,
                expectedChallenge,
                expectedOrigin: ORIGIN,
                expectedRPID: RP_ID,
            });

            if (verification.verified) {
                const registrationInfo = verification.registrationInfo;

                const credentialID = registrationInfo.credentialID || registrationInfo.credential?.id;
                const credentialPublicKey = registrationInfo.credentialPublicKey || registrationInfo.credential?.publicKey;
                const counter = registrationInfo.counter !== undefined ? registrationInfo.counter : 0;

                if (!credentialID || !credentialPublicKey) {
                    console.error('Registration Info structure:', Object.keys(registrationInfo));
                    return {
                        statusCode: 500,
                        headers,
                        body: JSON.stringify({
                            error: 'Failed to extract credential data',
                            debug: Object.keys(registrationInfo)
                        }),
                    };
                }

                const credentials = [{
                    credentialID: Buffer.from(credentialID).toString('base64'),
                    credentialPublicKey: Buffer.from(credentialPublicKey).toString('base64'),
                    counter,
                    transports: response.response.transports || ['internal'], // Guardar transports
                }];

                await saveUser(email, credentials);
                delete global.currentChallenge;

                // Generar Custom Token de Firebase para auto-login
                const customToken = await admin.auth().createCustomToken(email);

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        verified: true,
                        token: customToken,
                        email: email
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
        console.error('Error in webauthn-register:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
