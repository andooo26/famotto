import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from './firebase';
import { firestoreUtils } from './firebaseUtils';

// プロバイダ設定
const googleProvider = new GoogleAuthProvider();

// Googleでサインイン
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // nameが空ならGoogleのアカウント名
    if (user.uid) {
      try {
        const userDoc = await firestoreUtils.getDocument('users', user.uid) as { id: string; name?: string } | null;
        const googleName = user.displayName || '';
        const isNewUser = !userDoc;
        const needsNameUpdate = !userDoc || !userDoc.name || userDoc.name.trim() === '';
        const groupId = crypto.randomUUID();
        
        // 新規ユーザーの場合、createdAtとname, uidをuid/フィールドに追加, Googleのアイコンを設定
        if (isNewUser) {
          const userData: any = {
            uid: user.uid,
            createdAt: serverTimestamp(),
            groupId: groupId,
            //追記
            iconUrl: user.photoURL || '',
          };
          if (googleName) {
            userData.name = googleName;
          }
          await firestoreUtils.setDocument('users', user.uid, userData);

          //groupsコレクション作成
          const groupData = {
            groupId: groupId,
            groupUrl: 'まだだよ',
            members: [user.uid],
            createdAt: serverTimestamp(),
          };
          await firestoreUtils.setDocument('groups', groupId, groupData);
          
          // Googleアカウントのアイコンをに保存
          if (user.photoURL) {
            try {
              const response = await fetch(user.photoURL);
              const blob = await response.blob();
              const storageRef = ref(storage, `users/${user.uid}/icon.png`);
              await uploadBytes(storageRef, blob);
              const iconUrl = await getDownloadURL(storageRef);
              await firestoreUtils.setDocument('users', user.uid, {
                iconUrl: iconUrl,
              });
            } catch (iconError) {
              console.error('アイコンの保存に失敗:', iconError);
            }
          }
        } 
        else if (needsNameUpdate && googleName) {
          await firestoreUtils.setDocument('users', user.uid, {
            name: googleName,
          });
        }
      } catch (firestoreError) {
        console.error('ユーザー情報の更新エラー:', firestoreError);
      }
    }
    
    return user;
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