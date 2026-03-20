import { jobApi, locationApi } from '../services/api';

let seeded = false;

export async function seedInitialData() {
  // Only attempt seed once per session
  if (seeded) return;
  seeded = true;

  try {
    // Check if jobs already exist
    const existingJobs = await jobApi.getAll() as any[];
    if (existingJobs.length === 0) {
      console.log("Seeding initial jobs via API...");
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
        await jobApi.create(job);
      }
    }

    // Check if locations already exist
    const existingLocations = await locationApi.getAll() as any[];
    if (existingLocations.length === 0) {
      console.log("Seeding initial locations via API...");
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
        await locationApi.create(loc);
      }
    }
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}
