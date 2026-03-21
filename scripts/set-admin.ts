// One-time script: Set a user as ADMIN in Firestore
// Usage: npx tsx scripts/set-admin.ts <email>

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const keyPath = path.resolve(process.cwd(), 'spear-1c8af-firebase-adminsdk-fbsvc-e1ad9c031b.json');
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const email = process.argv[2] || 'mitharithu16@gmail.com';

async function setAdmin() {
  console.log(`\n🔍 Looking up Firebase Auth user: ${email}...`);
  
  try {
    const authUser = await admin.auth().getUserByEmail(email);
    console.log(`✅ Found user: ${authUser.displayName || authUser.email} (UID: ${authUser.uid})`);

    // Check if user doc exists in Firestore
    const userDoc = await admin.firestore().collection('users').doc(authUser.uid).get();
    
    if (userDoc.exists) {
      // Update existing doc
      await admin.firestore().collection('users').doc(authUser.uid).update({ role: 'ADMIN' });
      console.log(`✅ Updated existing user document → role: ADMIN`);
    } else {
      // Create new doc with ADMIN role
      await admin.firestore().collection('users').doc(authUser.uid).set({
        uid: authUser.uid,
        name: authUser.displayName || 'Admin',
        email: authUser.email,
        role: 'ADMIN',
        profileImage: authUser.photoURL || '',
        createdAt: new Date().toISOString(),
      });
      console.log(`✅ Created user document with role: ADMIN`);
    }

    // Also set custom claims
    await admin.auth().setCustomUserClaims(authUser.uid, { role: 'ADMIN' });
    console.log(`✅ Set custom auth claims → role: ADMIN`);

    console.log(`\n🎉 Done! "${email}" is now an ADMIN.`);
    console.log(`   → Log in at /admin/login to access the Systems Terminal.\n`);
    
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.log(`\n❌ No Firebase Auth account found for "${email}".`);
      console.log(`   → Please register first at /register, then run this script again.\n`);
    } else {
      console.error('Error:', error.message);
    }
  }

  process.exit(0);
}

setAdmin();
