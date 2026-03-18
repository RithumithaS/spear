export type UserRole = 'USER' | 'ADMIN' | 'DIRECTOR' | 'PRODUCTION_HOUSE';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  bio?: string;
  skills?: string[];
  profileImage?: string;
  createdAt: string;
}

export interface PortfolioItem {
  id?: string;
  userId: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: string;
}

export interface Connection {
  id?: string;
  senderId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface JobPosting {
  id?: string;
  title: string;
  description: string;
  postedBy: string;
  roleRequired: string;
  location: string;
  createdAt: string;
}

export interface JobApplication {
  id?: string;
  userId: string;
  jobId: string;
  status: 'APPLIED' | 'SELECTED' | 'REJECTED';
  createdAt: string;
}

export interface ShootingLocation {
  id?: string;
  name: string;
  address: string;
  pricePerDay: number;
  ownerId: string;
  imageUrl: string;
  createdAt: string;
}

export interface ChatMessage {
  id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}
