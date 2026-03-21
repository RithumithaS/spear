import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Initialize Firebase Admin SDK (singleton)
if (!admin.apps.length) {
  // Priority 1: Load from local service account JSON file (development)
  const localKeyPath = path.resolve(process.cwd(), 'spear-1c8af-firebase-adminsdk-fbsvc-e1ad9c031b.json');
  // Priority 2: Load from environment variable (production / Vercel)
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (fs.existsSync(localKeyPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('[Admin SDK] Initialized from local service account file.');
  } else if (serviceAccountEnv) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccountEnv)),
    });
    console.log('[Admin SDK] Initialized from FIREBASE_SERVICE_ACCOUNT_KEY env var.');
  } else {
    // Fallback: works on Google Cloud / Firebase-hosted environments
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID || 'spear-1c8af',
    });
    console.log('[Admin SDK] Initialized with application default credentials.');
  }
}

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'mitharithu16@gmail.com').split(',').map(e => e.trim());

async function verifyAdmin(req: VercelRequest): Promise<admin.auth.DecodedIdToken> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.split('Bearer ')[1];
  const decoded = await admin.auth().verifyIdToken(token);

  // Check if the user is an admin
  const userDoc = await admin.firestore().collection('users').doc(decoded.uid).get();
  const userData = userDoc.data();
  const isAdmin = userData?.role === 'ADMIN' || ADMIN_EMAILS.includes(decoded.email || '');

  if (!isAdmin) {
    throw new Error('Insufficient permissions: Admin access required');
  }

  return decoded;
}

function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract the action from the URL path
  // URL pattern: /api/admin/[action]
  const urlParts = (req.url || '').split('/').filter(Boolean);
  const action = urlParts[urlParts.length - 1];

  try {
    // Verify admin access for all requests
    await verifyAdmin(req);

    switch (action) {
      case 'delete-user': {
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
        const { uid } = req.body;
        if (!uid) return res.status(400).json({ error: 'User UID is required' });

        // Delete from Firebase Auth
        await admin.auth().deleteUser(uid);
        // Delete from Firestore
        await admin.firestore().collection('users').doc(uid).delete();

        return res.status(200).json({ success: true, message: `User ${uid} permanently deleted from Auth and Firestore` });
      }

      case 'list-users': {
        if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
        const listResult = await admin.auth().listUsers(100);
        const users = listResult.users.map(u => ({
          uid: u.uid,
          email: u.email,
          displayName: u.displayName,
          disabled: u.disabled,
          emailVerified: u.emailVerified,
          creationTime: u.metadata.creationTime,
          lastSignInTime: u.metadata.lastSignInTime,
          photoURL: u.photoURL,
          providerData: u.providerData.map(p => ({ providerId: p.providerId })),
        }));
        return res.status(200).json({ users });
      }

      case 'set-role': {
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
        const { uid: roleUid, role } = req.body;
        if (!roleUid || !role) return res.status(400).json({ error: 'UID and role are required' });

        const validRoles = ['USER', 'ADMIN', 'DIRECTOR', 'PRODUCTION_HOUSE'];
        if (!validRoles.includes(role)) {
          return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
        }

        // Update role in Firestore
        await admin.firestore().collection('users').doc(roleUid).update({ role });
        // Set custom claims on the auth token
        await admin.auth().setCustomUserClaims(roleUid, { role });

        return res.status(200).json({ success: true, message: `Role updated to ${role} for user ${roleUid}` });
      }

      case 'disable-user': {
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
        const { uid: disableUid, disabled } = req.body;
        if (!disableUid || typeof disabled !== 'boolean') {
          return res.status(400).json({ error: 'UID and disabled (boolean) are required' });
        }

        await admin.auth().updateUser(disableUid, { disabled });

        return res.status(200).json({
          success: true,
          message: `User ${disableUid} ${disabled ? 'disabled' : 'enabled'}`,
        });
      }

      default:
        return res.status(404).json({ error: `Unknown action: ${action}` });
    }
  } catch (error: any) {
    console.error('Admin API Error:', error);

    if (error.message?.includes('Insufficient permissions') || error.message?.includes('authorization')) {
      return res.status(403).json({ error: error.message });
    }

    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
