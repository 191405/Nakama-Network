import { db, storage } from './firebase';
import { 
  collection, doc, setDoc, getDoc, getDocs, 
  query, where, orderBy, serverTimestamp, updateDoc, increment 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const MANGA_COLLECTION = 'manga_series';
const CHAPTERS_COLLECTION = 'manga_chapters';

export const mangaAPI = {
  // Create a new Manga Series
  async createSeries(userId, data, coverFile) {
    try {
      const mangaRef = doc(collection(db, MANGA_COLLECTION));
      let coverUrl = null;
      
      if (coverFile) {
        const ext = coverFile.name.split('.').pop();
        const coverPath = `manga_covers/${mangaRef.id}_cover.${ext}`;
        const storageRef = ref(storage, coverPath);
        await uploadBytes(storageRef, coverFile);
        coverUrl = await getDownloadURL(storageRef);
      }

      const seriesData = {
        title: data.title,
        synopsis: data.synopsis,
        genre: data.genre || 'Action',
        authorId: userId,
        coverUrl: coverUrl,
        chapterCount: 0,
        views: 0,
        status: 'Ongoing',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(mangaRef, seriesData);
      return { id: mangaRef.id, ...seriesData };
    } catch (e) {
      console.error('Error creating manga series:', e);
      throw e;
    }
  },

  // Get all Manga series
  async getAllSeries() {
    try {
      const q = query(collection(db, MANGA_COLLECTION), orderBy('updatedAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('Error fetching all manga:', e);
      return [];
    }
  },

  // Get user's Manga series
  async getUserSeries(userId) {
    if (userId === 'guest') return [];
    try {
      const q = query(collection(db, MANGA_COLLECTION), where('authorId', '==', userId), orderBy('updatedAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('Error fetching user manga:', e);
      return [];
    }
  },

  // Get single Manga Series
  async getSeries(mangaId) {
    try {
      const docRef = doc(db, MANGA_COLLECTION, mangaId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) throw new Error('Manga not found');
      return { id: snap.id, ...snap.data() };
    } catch (e) {
      console.error('Error fetching manga:', e);
      throw e;
    }
  },

  // Upload Chapter with multiple pages
  async uploadChapter(mangaId, chapterData, filesArray) {
    try {
      // 1. Upload all image files concurrently
      const pageUrls = await Promise.all(
        filesArray.map(async (file, index) => {
          const ext = file.name.split('.').pop();
          // Name formatting: mangaId_chapterTitle_pageIndex
          const cleanTitle = chapterData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
          const filePath = `manga_pages/${mangaId}/${cleanTitle}/page_${index + 1}.${ext}`;
          
          const storageRef = ref(storage, filePath);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          return { pageNumber: index + 1, url };
        })
      );

      // 2. Sort pages just in case Promise.all returned out of order
      pageUrls.sort((a, b) => a.pageNumber - b.pageNumber);

      // 3. Save chapter to DB
      const chapterRef = doc(collection(db, CHAPTERS_COLLECTION));
      const chapDoc = {
        mangaId,
        title: chapterData.title,
        chapterNumber: Number(chapterData.chapterNumber),
        pages: pageUrls,
        views: 0,
        createdAt: serverTimestamp()
      };
      await setDoc(chapterRef, chapDoc);

      // 4. Update the parent Manga series chapterCount & updatedAt
      const mangaRef = doc(db, MANGA_COLLECTION, mangaId);
      await updateDoc(mangaRef, {
        chapterCount: increment(1),
        updatedAt: serverTimestamp()
      });

      return { id: chapterRef.id, ...chapDoc };
    } catch (e) {
      console.error('Error uploading chapter:', e);
      throw e;
    }
  },

  // Get all chapters for a manga
  async getChapters(mangaId) {
    try {
      const q = query(
        collection(db, CHAPTERS_COLLECTION), 
        where('mangaId', '==', mangaId),
        orderBy('chapterNumber', 'asc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('Error fetching chapters:', e);
      return [];
    }
  },

  // Get a single chapter
  async getChapter(chapterId) {
    try {
      const docRef = doc(db, CHAPTERS_COLLECTION, chapterId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) throw new Error('Chapter not found');
      
      // Increment chapter views
      await updateDoc(docRef, { views: increment(1) });
      
      const data = snap.data();
      // Increment parent manga views
      const mangaRef = doc(db, MANGA_COLLECTION, data.mangaId);
      await updateDoc(mangaRef, { views: increment(1) });

      return { id: snap.id, ...data };
    } catch (e) {
      console.error('Error fetching chapter:', e);
      throw e;
    }
  }
};
