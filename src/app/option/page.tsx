"use client";
import Image from 'next/image'; 
import './../globals.css';

import './../lib/firebase.ts';
// import React, { useState, useCallback } from 'react';
// import { getDocment } from './../lib/firebaseUtils.ts';
// import { updateDocment } from './../lib/firebaseUtils.ts';
// import { uploadFile } from './../lib/firebaseUtils.ts';
// import { getDownloadUrl } from './../lib/firebaseUtils.ts';

export default function DiaryPage() {
    //テスト
    const a = () => {
        alert("アイコンを変更ボタンが押されました");
    };
    const b = () => {
        alert("保存ボタンが押されました");
    };

    return (
        <div>
            <header className="header">
                <a href="" className=""><Image
                    src="/image copy.png"
                    alt=""
                    width={50}
                    height={40}
                    style={{ borderRadius: '50%' }} />
                </a>
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
                                <Image src="/image copy.png" alt="" width={200} height={40} style={{ borderRadius: '50%' }} />
                            </div>
                            <button onClick={a} className='absolute right-[-35px] bottom-[-10px] p-1 transition'>
                                <Image src="/upload.jpg" alt="" width={32} height={32}/>
                            </button>
                        </div>
                    </div>
                    <input type="text" className='text-3xl mx-auto border-2 w-60 mt-7 placeholder:text-xl' placeholder="新しいユーザー名を入力"></input>
                    <button onClick={b} className='mt-7 text-xl w-30 bg-purple-300 rounded-full'>✓保存する</button>
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