"use client";
import React, {useState,useEffect} from 'react';
import Image from 'next/image'; 
import './../globals.css';
import './../../lib/firebase';
import { firestoreUtils, storageUtils } from './../../lib/firebaseUtils';
import { getAuth } from 'firebase/auth';

export default function DiaryPage() {

    const [previewUrl, setPreviewUrl] = useState("/icon.jpg");
    const [imageFile, setImageFile] = useState<File | null>(null); // ← 画像ファイル保持
    const [userName, setUserName] = useState(""); // ← ユーザー名保持

    const FileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file); // ← 保存用に保持
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            alert("ログインしていません");
            return;
        }

        const uid = user.uid;

        if (!userName) {
            alert("名前を入力してください");
            return;
        }

        try {
            // 1️⃣ uid に一致するドキュメントを検索
            const users = await firestoreUtils.getCollectionWhere("users", "uid", "==", uid);

            if (users.length === 0) {
                alert("ユーザーデータが見つかりませんでした。");
                return;
            }

            const targetDocId = users[0].id;

            // 2️⃣ 画像があれば Storage に更新して URL を取得
            let iconUrl = users[0].iconUrl ?? null;

            if (imageFile) {
                const path = `users/${uid}/icon.jpg`;
                iconUrl = await storageUtils.uploadFile(path, imageFile);
            }

            // 3️⃣ Firestore を更新
            await firestoreUtils.updateDocument("users", targetDocId, {
                name: userName,
                iconUrl: iconUrl,
                updatedAt: new Date(),
            });

            alert("保存しました！");

        } catch (error) {
            console.error(error);
            alert("保存中にエラーが発生しました");
        }
    };

    return (
        <div>
            <header className="header">
                <Image src="/icon.jpg" alt="" width={50} height={40} style={{ borderRadius: '50%', objectFit: "cover" }} />
                <h1 className="text-5xl">Fammoto</h1>
            </header>

            <main className="">
                <div className='flex  mt-3 pl-10'>
                    <Image src="/aoption.png" alt="" width={40} height={40} />
                    <h2 className="text-3xl">設定</h2>
                </div>
                <div className="flex flex-col items-center  m-10 bg-white rounded-xl shadow-2xl">
                    <div className='flex justify-center mt-7'>
                        <div className="relative w-32 h-32">
                            <div className="rounded-full bg-gray-200 w-full h-full flex items-center justify-center">
                                <Image src={previewUrl} alt="" fill={true} style={{ borderRadius: '50%', objectFit: 'cover' }} />
                            </div>
                            <form action="/" method="post" encType="multipart/form-data">
                                <input type="file" accept="image/*" id="file-upload-input" onChange={FileChange} style={{ display: 'none' }} />
                                <label htmlFor="file-upload-input" className='absolute right-[-35px] bottom-[-10px] p-1 transition cursor-pointer'>
                                    <Image src="/upload.jpg" alt="" width={32} height={32}/>
                                </label>
                            </form>
                        </div>
                    </div>
                    <input type="text" className='text-3xl mx-auto border-2 w-60 mt-7 placeholder:text-xl' placeholder="新しいユーザー名を入力" value={userName}
                        onChange={(e) => setUserName(e.target.value)}></input>
                    <button onClick={handleSave} className='mt-7 text-xl w-30 bg-purple-300 rounded-full'>✓保存する</button>
                    <div className='flex mt-7 mb-7'>
                        <p className='text-2xl'>招待リンク　</p>
                        <p className='text-2xl text-gray-400'>/*リンク*/</p>
                    </div>
                </div>
            </main>

            <footer className="footer">
                <a href="./diary"><Image src="/add.png" alt="" width={60} height={60} /><span>日記追加</span></a>
                <a href="./theme"><Image src="/theme.png" alt="" width={60} height={60} /><span>今日のお題</span></a>
                <a href="./menu"><Image src="/menu.png" alt="" width={60} height={60} /><span>日記確認</span></a>
            </footer>
        </div>
    )
}