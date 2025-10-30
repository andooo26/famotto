import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from './firebase';

// DB操作
export const firestoreUtils = {
  // ドキュメントを取得
  getDocument: async (collectionName: string, docId: string) => {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  // コレクション内のすべてのドキュメントを取得
  getCollection: async (collectionName: string) => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // 条件付きクエリ
  getCollectionWhere: async (collectionName: string, field: string, operator: any, value: any) => {
    const q = query(collection(db, collectionName), where(field, operator, value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // ドキュメントを追加
  addDocument: async (collectionName: string, data: any) => {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  },

  // ドキュメントを更新
  updateDocument: async (collectionName: string, docId: string, data: any) => {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
  },

  // ドキュメントを削除
  deleteDocument: async (collectionName: string, docId: string) => {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  }
};

// Firebase Storage 操作
export const storageUtils = {
  // ファイルをアップロード
  uploadFile: async (path: string, file: File) => {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  },

  // ファイルのダウンロードURLを取得
  getDownloadUrl: async (path: string) => {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  },

  // ファイルを削除
  deleteFile: async (path: string) => {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  }
};

