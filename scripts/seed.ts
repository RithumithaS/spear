import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCpZjHZoi59EYpapp7Xhw9D3Z3NdR2OSCc",
  authDomain: "spear-1c8af.firebaseapp.com",
  projectId: "spear-1c8af",
  storageBucket: "spear-1c8af.firebasestorage.app",
  messagingSenderId: "70373684365",
  appId: "1:70373684365:web:9be691c708aa81753fdec4",
  measurementId: "G-Z6310QYWP3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userNames = [
  "John Doe", "Jane Smith", "Alex Johnson", "Emily Davis", "Michael Brown",
  "Sarah Miller", "David Wilson", "Laura Moore", "James Taylor", "Emma Anderson",
  "Robert Thomas", "Olivia Jackson", "William White", "Sophia Harris", "Richard Martin",
  "Isabella Garcia", "Charles Martinez", "Mia Robinson", "Joseph Clark", "Charlotte Lewis"
];

const roles = ['USER', 'DIRECTOR', 'PRODUCTION_HOUSE'] as const;

async function seed() {
  console.log("Seeding database...");

  // Seed Users
  const userIds: string[] = [];
  for (let i = 0; i < 20; i++) {
    const uid = `test_user_uid_${i}_${Date.now()}`;
    userIds.push(uid);
    await setDoc(doc(db, 'users', uid), {
      uid: uid,
      name: userNames[i] || `User ${i}`,
      email: `user${i}@example.com`,
      role: roles[i % 3],
      bio: "Industry professional with a passion for creative storytelling.",
      skills: ["Directing", "Editing", "Cinematography"].slice(0, (i % 3) + 1),
      profileImage: `https://i.pravatar.cc/150?u=${uid}`,
      createdAt: new Date().toISOString()
    });
    console.log(`Created user ${i}`);
  }

  // Seed Jobs
  for (let i = 0; i < 20; i++) {
    await addDoc(collection(db, 'jobs'), {
      title: `Looking for ${['Lead Actor', 'Cinematographer', 'Editor', 'Sound Mixer'][i % 4]}`,
      description: "We are casting/hiring for an upcoming blockbuster independent film. Great pay and credits.",
      postedBy: userIds[i % userIds.length],
      roleRequired: ['Actor', 'Camera', 'Editor', 'Sound'][i % 4],
      location: ['Mumbai', 'Los Angeles', 'London', 'New York'][i % 4],
      createdAt: new Date().toISOString()
    });
    console.log(`Created job ${i}`);
  }

  // Seed Locations
  for (let i = 0; i < 20; i++) {
    await addDoc(collection(db, 'locations'), {
      name: `${['Victorian', 'Modern', 'Rustic', 'Sci-Fi'][i % 4]} ${['Mansion', 'Apartment', 'Cabin', 'Studio'][i % 4]}`,
      address: `${100 + i} Film City, World`,
      pricePerDay: (i + 1) * 100,
      ownerId: userIds[i % userIds.length],
      imageUrl: `https://picsum.photos/seed/loc${i}/800/600`,
      createdAt: new Date().toISOString()
    });
    console.log(`Created location ${i}`);
  }

  // Seed Portfolios
  for (let i = 0; i < 20; i++) {
    await addDoc(collection(db, 'portfolios'), {
      userId: userIds[i % userIds.length],
      title: `My Masterpiece ${i}`,
      description: "A showcase of my recent work in the film industry.",
      mediaUrl: `https://picsum.photos/seed/port${i}/800/600`,
      mediaType: 'image',
      createdAt: new Date().toISOString()
    });
    console.log(`Created portfolio item ${i}`);
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});
