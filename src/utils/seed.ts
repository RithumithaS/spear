import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../firebase';

export async function seedInitialData() {
  try {
    const jobsSnap = await getDocs(query(collection(db, 'jobs'), limit(1)));
    if (jobsSnap.empty) {
      console.log("Seeding initial jobs...");
      const jobs = [
        {
          title: "Lead Actor for Sci-Fi Short",
          description: "Looking for a versatile actor for a 15-minute sci-fi short film. Must be comfortable with green screen work.",
          roleRequired: "Actor",
          location: "Mumbai, India",
          postedBy: "system",
          createdAt: new Date().toISOString()
        },
        {
          title: "Cinematographer for Music Video",
          description: "Indie band looking for a DP with their own gear for a 1-day shoot. Style is gritty and handheld.",
          roleRequired: "Cinematographer",
          location: "Bangalore, India",
          postedBy: "system",
          createdAt: new Date().toISOString()
        }
      ];
      for (const job of jobs) {
        await addDoc(collection(db, 'jobs'), job);
      }
    }

    const locsSnap = await getDocs(query(collection(db, 'locations'), limit(1)));
    if (locsSnap.empty) {
      console.log("Seeding initial locations...");
      const locations = [
        {
          name: "Modern Industrial Loft",
          address: "Lower Parel, Mumbai",
          pricePerDay: 450,
          ownerId: "system",
          imageUrl: "https://picsum.photos/seed/loft/800/600",
          createdAt: new Date().toISOString()
        },
        {
          name: "Rustic Farmhouse",
          address: "Karjat, Maharashtra",
          pricePerDay: 300,
          ownerId: "system",
          imageUrl: "https://picsum.photos/seed/farm/800/600",
          createdAt: new Date().toISOString()
        }
      ];
      for (const loc of locations) {
        await addDoc(collection(db, 'locations'), loc);
      }
    }
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}
