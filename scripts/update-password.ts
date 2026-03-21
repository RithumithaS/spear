import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const keyPath = path.resolve(process.cwd(), 'spear-1c8af-firebase-adminsdk-fbsvc-e1ad9c031b.json');
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

if (!admin.apps.length) {
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
}

const uid = 'zoeT7sHWJkVvyUQq1vwz3YWOqh42';
const newPassword = 'AdminRithu';

async function updatePassword() {
  try {
    await admin.auth().updateUser(uid, {
      password: newPassword,
    });
    console.log(`✅ Password successfully set to [${newPassword}] for UID: ${uid}`);
  } catch (error: any) {
    console.error('❌ Error updating password:', error.message);
  }
  process.exit(0);
}

updatePassword();
