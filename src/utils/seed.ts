import { userApi, jobApi, locationApi, portfolioApi } from '../services/api';

let seeded = false;

export async function seedInitialData() {
  if (seeded) return;
  seeded = true;

  try {
    const existingJobs = await jobApi.getAll() as any[];
    if (existingJobs.length < 20) {
      console.log("Dynamically seeding 20+ records across collections...");

      const userNames = [
        "Christopher Nolan", "Martin Scorsese", "Quentin Tarantino", "Steven Spielberg", "James Cameron",
        "Greta Gerwig", "Kathryn Bigelow", "Sofia Coppola", "Jane Campion", "Ava DuVernay",
        "Leonardo DiCaprio", "Brad Pitt", "Denzel Washington", "Tom Hanks", "Robert De Niro",
        "Meryl Streep", "Cate Blanchett", "Viola Davis", "Natalie Portman", "Emma Stone"
      ];
      const roles = ['USER', 'DIRECTOR', 'PRODUCTION_HOUSE'] as const;
      
      const userIds = [];
      for (let i = 0; i < 20; i++) {
        const uid = `seeded_uid_${Date.now()}_${i}`;
        userIds.push(uid);
        await userApi.create({
          uid: uid,
          name: userNames[i] || `Talent ${i}`,
          email: `talent${i}@spear.app`,
          role: roles[i % 3],
          bio: "Award-winning professional deeply passionate about cinema, storytelling, and pushing the boundaries of visual arts.",
          skills: ["Directing", "Screenwriting", "Acting", "Cinematography"].slice(0, (i % 3) + 2),
          profileImage: `https://i.pravatar.cc/300?u=${uid}`,
          createdAt: new Date().toISOString()
        });
      }

      for (let i = 0; i < 20; i++) {
        await jobApi.create({
          title: `Looking for ${['Lead Actor', 'Cinematographer', 'Editor', 'Sound Mixer'][i % 4]} - Project ${i}`,
          description: "We are casting and crewing for a highly anticipated upcoming independent thriller. Competitive day rate, stellar credits guaranteed.",
          postedBy: userIds[i % userIds.length],
          roleRequired: ['Actor', 'Camera', 'Editor', 'Sound'][i % 4],
          location: ['Mumbai', 'Los Angeles', 'London', 'New York'][i % 4],
          createdAt: new Date(Date.now() - i * 86400000).toISOString()
        });
      }

      for (let i = 0; i < 20; i++) {
        await locationApi.create({
          name: `${['Victorian', 'Modern', 'Rustic', 'Sci-Fi'][i % 4]} ${['Mansion', 'Apartment', 'Cabin', 'Studio'][i % 4]} ${i}`,
          address: `${100 + i} Cinematic Avenue, Studio City`,
          pricePerDay: Number(((i % 5) + 2) * 200),
          ownerId: userIds[i % userIds.length],
          imageUrl: `https://picsum.photos/seed/location${i}/800/600`,
          createdAt: new Date(Date.now() - i * 86400000).toISOString()
        });
      }

      for (let i = 0; i < 20; i++) {
        await portfolioApi.create({
          userId: userIds[i % userIds.length],
          title: `Masterpiece Visuals - Reel ${i}`,
          description: "A comprehensive showcase of my recent production work, highlighting advanced lighting and narrative structures.",
          mediaUrl: `https://picsum.photos/seed/portfolio${i}/800/600`,
          mediaType: 'image',
          createdAt: new Date().toISOString()
        });
      }

      console.log("Seeding completely finished! You now have full diverse datasets!");
      
      // Auto-reload to immediately reflect changes in UI
      setTimeout(() => window.location.reload(), 1500);
    }
  } catch (error) {
    console.error("Error dynamically seeding data:", error);
  }
}
