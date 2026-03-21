import { db, auth } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  or,
  serverTimestamp
} from 'firebase/firestore';

export const userApi = {
  create: async (user: any) => {
    await setDoc(doc(db, 'users', user.uid), user);
    return user;
  },

  getByUid: async (uid: string) => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return docSnap.data();
    return null;
  },

  getAll: async (excludeUid?: string) => {
    const snap = await getDocs(collection(db, 'users'));
    let users = snap.docs.map(d => d.data());
    if (excludeUid) {
      users = users.filter(u => u.uid !== excludeUid);
    }
    return users;
  },

  update: async (uid: string, data: any) => {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, data);
    const snap = await getDoc(docRef);
    return snap.data();
  },

  delete: async (uid: string) => {
    await deleteDoc(doc(db, 'users', uid));
  },
};

export const jobApi = {
  create: async (job: any) => {
    const docRef = await addDoc(collection(db, 'jobs'), {
      ...job,
      createdAt: new Date().toISOString()
    });
    const snap = await getDoc(docRef);
    return { id: docRef.id, ...snap.data() };
  },

  getAll: async (search?: string) => {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const jobs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    
    if (search) {
      const lowerSearch = search.toLowerCase();
      return jobs.filter(j => 
        j.title?.toLowerCase().includes(lowerSearch) || 
        j.description?.toLowerCase().includes(lowerSearch) ||
        j.roleRequired?.toLowerCase().includes(lowerSearch)
      );
    }
    return jobs;
  },

  getById: async (id: string) => {
    const snap = await getDoc(doc(db, 'jobs', id));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
    return null;
  },

  delete: async (id: string) => {
    await deleteDoc(doc(db, 'jobs', id));
  },
};

export const connectionApi = {
  send: async (connection: any) => {
    const docRef = await addDoc(collection(db, 'connections'), {
      ...connection,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...connection, status: 'PENDING' };
  },

  getUserConnections: async (userId: string) => {
    const q1 = query(collection(db, 'connections'), where('senderId', '==', userId));
    const q2 = query(collection(db, 'connections'), where('receiverId', '==', userId));
    
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const map = new Map();
    snap1.docs.forEach(d => map.set(d.id, { id: d.id, ...d.data() }));
    snap2.docs.forEach(d => map.set(d.id, { id: d.id, ...d.data() }));
    
    return Array.from(map.values());
  },

  getPending: async (userId: string) => {
    const q = query(
      collection(db, 'connections'), 
      where('receiverId', '==', userId),
      where('status', '==', 'PENDING')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  accept: async (id: string) => {
    await updateDoc(doc(db, 'connections', id), { status: 'ACCEPTED' });
  },

  reject: async (id: string) => {
    await updateDoc(doc(db, 'connections', id), { status: 'REJECTED' });
  },
};

export const messageApi = {
  send: async (message: any) => {
    const docRef = await addDoc(collection(db, 'messages'), {
      ...message,
      timestamp: new Date().toISOString()
    });
    return { id: docRef.id, ...message };
  },

  getConversation: async (userId1: string, userId2: string) => {
    // Firestore lacks native OR with inequalities efficiently easily without composite indexes
    // Fetching both permutations
    const q1 = query(collection(db, 'messages'), where('senderId', '==', userId1), where('receiverId', '==', userId2));
    const q2 = query(collection(db, 'messages'), where('senderId', '==', userId2), where('receiverId', '==', userId1));
    
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    let messages = [...snap1.docs, ...snap2.docs].map(d => ({ id: d.id, ...d.data() })) as any[];
    
    messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return messages;
  },

  getChatPartners: async (userId: string) => {
    const q1 = query(collection(db, 'messages'), where('senderId', '==', userId));
    const q2 = query(collection(db, 'messages'), where('receiverId', '==', userId));
    
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const partnerIds = new Set<string>();
    
    snap1.docs.forEach(d => partnerIds.add(d.data().receiverId));
    snap2.docs.forEach(d => partnerIds.add(d.data().senderId));
    
    if (partnerIds.size === 0) return [];
    
    // Fetch users (safely chunk in real app, here we fetch all users and filter)
    const allUsers = await userApi.getAll();
    return allUsers.filter((u: any) => partnerIds.has(u.uid));
  },
};

export const locationApi = {
  create: async (location: any) => {
    const docRef = await addDoc(collection(db, 'locations'), {
      ...location,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...location };
  },

  getAll: async () => {
    const snap = await getDocs(query(collection(db, 'locations'), orderBy('createdAt', 'desc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  delete: async (id: string) => {
    await deleteDoc(doc(db, 'locations', id));
  },
};

export const portfolioApi = {
  create: async (portfolio: any) => {
    const docRef = await addDoc(collection(db, 'portfolios'), {
      ...portfolio,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...portfolio };
  },

  getByUserId: async (userId: string) => {
    const q = query(collection(db, 'portfolios'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items;
  },

  delete: async (id: string) => {
    await deleteDoc(doc(db, 'portfolios', id));
  },
};

export const applicationApi = {
  apply: async (application: any) => {
    // Check if already applied
    const q = query(collection(db, 'applications'), where('userId', '==', application.userId), where('jobId', '==', application.jobId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      throw new Error("Already applied for this job.");
    }

    const docRef = await addDoc(collection(db, 'applications'), {
      ...application,
      status: 'APPLIED',
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...application };
  },

  getByUser: async (userId: string) => {
    const q = query(collection(db, 'applications'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  getByJob: async (jobId: string) => {
    const q = query(collection(db, 'applications'), where('jobId', '==', jobId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
};

export const reportApi = {
  create: async (report: any) => {
    const docRef = await addDoc(collection(db, 'reports'), {
      ...report,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...report, status: 'PENDING' };
  },

  getAll: async () => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  updateStatus: async (id: string, status: string) => {
    await updateDoc(doc(db, 'reports', id), { status });
  },

  delete: async (id: string) => {
    await deleteDoc(doc(db, 'reports', id));
  },
};

export const statsApi = {
  getStats: async (userId?: string) => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const jobsSnap = await getDocs(collection(db, 'jobs'));
      const locsSnap = await getDocs(collection(db, 'locations'));
      
      let userConnections = 0;
      if (userId) {
        const conns = await connectionApi.getUserConnections(userId);
        userConnections = conns.filter(c => c.status === 'ACCEPTED').length;
      }

      let totalReports = 0;
      try {
        const reportsSnap = await getDocs(collection(db, 'reports'));
        totalReports = reportsSnap.size;
      } catch (_) { /* non-admin can't read */ }
      
      return {
        totalUsers: usersSnap.size,
        totalJobs: jobsSnap.size,
        totalLocations: locsSnap.size,
        userConnections,
        totalReports,
      };
    } catch (e) {
      console.error(e);
      return { totalUsers: 0, totalJobs: 0, totalLocations: 0, userConnections: 0, totalReports: 0 };
    }
  }
};

// Admin API - calls privileged edge functions powered by Firebase Admin SDK
const ADMIN_API_BASE = import.meta.env.VITE_ADMIN_API_URL || '/api/admin';

export const adminApi = {
  deleteUserAuth: async (uid: string) => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${ADMIN_API_BASE}/delete-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ uid }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to delete user auth' }));
      throw new Error(err.error || 'Failed to delete user auth');
    }
    return res.json();
  },

  getAuthUsers: async () => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${ADMIN_API_BASE}/list-users`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch auth users');
    return res.json();
  },

  setUserRole: async (uid: string, role: string) => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${ADMIN_API_BASE}/set-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ uid, role }),
    });
    if (!res.ok) throw new Error('Failed to set role');
    return res.json();
  },

  disableUser: async (uid: string, disabled: boolean) => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${ADMIN_API_BASE}/disable-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ uid, disabled }),
    });
    if (!res.ok) throw new Error('Failed to update user status');
    return res.json();
  },
};
