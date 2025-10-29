import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from './firebase';

// プロバイダ設定
const googleProvider = new GoogleAuthProvider();

// Googleでサインイン
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Googleサインインエラー:', error);
    
    if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('ログインがキャンセルされました。もう一度お試しください。');
    }
    
    if (error.code === 'auth/popup-blocked') {
      throw new Error('ポップアップがブロックされました。ブラウザの設定でポップアップを許可してください。');
    }
    
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('ログインウィンドウが閉じられました。もう一度お試しください。');
    }
    
    throw new Error('ログインに失敗しました。もう一度お試しください。');
  }
};

// サインアウト
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('error:', error);
    throw error;
  }
};

// 認証状態の監視
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
