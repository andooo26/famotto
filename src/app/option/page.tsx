"use client";
import React, {useEffect, useState} from 'react';
import Image from 'next/image'; 
import './../globals.css';
import './../../lib/firebase';
import { firestoreUtils, storageUtils } from './../../lib/firebaseUtils';
import { getAuth } from 'firebase/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function DiaryPage() {

    const [headerIcon, setHeaderIcon] = useState("/icon.jpg"); //アイコンをfirebaseからとってきたい
    const [previewUrl, setPreviewUrl] = useState("/icon.jpg"); //こっちも
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [userName, setUserName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [groupUrl, setGroupUrl] = useState(""); //groupUrl表示させたい
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!user) return;
            
            try {
                const uid = user.uid;
                const userData = await firestoreUtils.getCollectionWhere("users", "uid", "==", uid);
                if (userData.length > 0) {
                    const userInfo = userData[0] as any;
                    // グループIDを設定
                    if (userInfo.groupId) {
                        setGroupUrl(`https://fam.and0.net/invite?id=${userInfo.groupId}`);
                    }
                    // ユーザー名を設定
                    if (userInfo.name) {
                        setUserName(userInfo.name);
                    }
                    // 電話番号を設定
                    if (userInfo.phoneNumber) {
                        setPhoneNumber(userInfo.phoneNumber);
                    }
                    // アイコンURLを設定
                    if (userInfo.iconUrl) {
                        setHeaderIcon(userInfo.iconUrl);
                        setPreviewUrl(userInfo.iconUrl);
                    }
                }
            } catch (error) {
                console.error("ユーザーデータ取得エラー", error);
            }
        });
        return () => unsubscribe();
    }, []);

    const FileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
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
            alert("ログインが必要です。");
            return;
        }
        const uid = user.uid;

        try {
            const users = await firestoreUtils.getCollectionWhere("users", "uid", "==", uid);
            if (users.length === 0) {
                alert("ユーザーデータが見つかりませんでした。");
                return;
            }
            const targetDocId = users[0].id;
            const userInfo = users[0] as any;

            let iconUrl = userInfo.iconUrl ?? null;
            if (imageFile) {
                const path = `users/${uid}/icon.png`;
                iconUrl = await storageUtils.uploadFile(path, imageFile);
            }

            await firestoreUtils.updateDocument("users", targetDocId, {
                name: userName,
                phoneNumber: phoneNumber,
                iconUrl: iconUrl,
                updatedAt: new Date(),
            });
            setToastMessage("保存しました！");
            setShowToast(true);
        } catch (error) {
            console.error(error);
            alert("保存中にエラーが発生しました");
        }
    };

    const handleCopyLink = async () => {
        if (!groupUrl) {
            return;
        }
        try {
            await navigator.clipboard.writeText(groupUrl);
            setToastMessage("招待リンクをコピーしました！");
            setShowToast(true);
        } catch (error) {
            console.error("コピーに失敗しました", error);
        }
    };

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    return (
        <div>
            <Header title="設定" />

            {showToast && (
                <div 
                    className="fixed top-20 left-1/2 z-50 px-6 py-3 rounded-full shadow-lg animate-fade-in"
                    style={{
                        backgroundColor: '#fcdf98',
                        color: '#444',
                        fontWeight: 'bold',
                        transform: 'translateX(-50%)',
                    }}
                >
                    {toastMessage}
                </div>
            )}

            <main className="" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: 'calc(100vh - 200px)', padding: '20px' }}>
                <div className="flex flex-col items-center m-4 sm:m-10 bg-white rounded-xl shadow-2xl" style={{ width: '100%', maxWidth: '800px' }}>
                    <div className='flex justify-center mt-7'>
                        <div className="relative w-32 h-32">
                            <div className="rounded-full bg-gray-200 w-full h-full flex items-center justify-center overflow-hidden">
                                <img 
                                    src={previewUrl} 
                                    alt="" 
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        borderRadius: '50%', 
                                        objectFit: 'cover' 
                                    }} 
                                />
                            </div>
                            <form action="/" method="post" encType="multipart/form-data">
                                <input type="file" accept="image/*" id="file-upload-input" onChange={FileChange} style={{ display: 'none' }} />
                                <label htmlFor="file-upload-input" className='absolute right-[-35px] bottom-[-10px] p-1 transition cursor-pointer'>
                                    <Image src="/upload.jpg" alt="" width={32} height={32}/>
                                </label>
                            </form>
                        </div>
                    </div>
                    <input type="text" className='text-xl sm:text-3xl mx-auto border-2 w-full sm:w-60 mt-7 px-2 placeholder:text-base sm:placeholder:text-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition' placeholder="新しいユーザー名を入力" value={userName}
                        onChange={(e) => setUserName(e.target.value)}></input>
                    <div className='flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mt-7 px-4 sm:px-0 w-full justify-center'>
                        <p className='text-xl sm:text-2xl whitespace-nowrap'>わたしの電話番号</p>
                        <input 
                            type="tel" 
                            className='text-base sm:text-xl border-2 w-full sm:w-60 placeholder:text-sm sm:placeholder:text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition' 
                            placeholder="電話番号を入力" 
                            value={phoneNumber}
                            onChange={(e) => {
                                // 数値のみを受け付ける
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                setPhoneNumber(value);
                            }}
                        />
                    </div>
                    <div className='flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mt-7 mb-7 px-4 sm:px-0 w-full justify-center'>
                        <p className='text-xl sm:text-2xl whitespace-nowrap'>招待リンク　</p>
                        <div className='flex-1 min-w-0 flex justify-center'>
                            <p className='text-base sm:text-2xl text-gray-400 break-all text-center'>{groupUrl || "リンクがありません"}</p>
                        </div>
                        {groupUrl && (
                            <button
                                onClick={handleCopyLink}
                                className="px-4 py-2 text-sm rounded-full transition hover:opacity-80 whitespace-nowrap"
                                style={{
                                    backgroundColor: '#fcdf98',
                                    color: '#444',
                                    fontWeight: 'bold',
                                    border: 'none',
                                }}
                            >
                                コピー
                            </button>
                        )}
                    </div>
                    <button
                        onClick={handleSave}
                        className="mt-7 mb-7 text-xl w-30 rounded-full"
                        style={{
                            backgroundColor: '#fcdf98',
                            color: '#444',
                            fontWeight: 'bold',
                            border: 'none',
                        }}
                    >
                        保存する
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    )
}