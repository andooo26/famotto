"use client";
import Image from 'next/image';
import './../globals.css';


export default function DiaryPage() {
    //テスト
    const a = () => {
        alert("動画/画像を追加ボタンが押されました");
    };
    const b = () => {
        alert("声で入力ボタンが押されました");
    };
    const c = () => {
        alert("日記を投稿ボタンが押されました");
    };

    return (
        <div>
            <header className="header">
                <a href="https://google.com"/*設定画面へ*/ className=""><Image
                    src="/image copy.png"
                    alt=""
                    width={50}
                    height={40}
                    style={{ borderRadius: '50%' }} />
                </a>
                <h1 className="text-5xl">Fammoto</h1>
            </header>

            <main className="">
                <div className='flex  mt-3'>
                    <Image src="/add.png" alt="" width={40} height={40} />
                    <h2 className="text-3xl">日記追加</h2>
                </div>
                <div className=" m-10 bg-white rounded-xl shadow-2xl">
                    <div className='flex'><input type="date" className='text-2xl'></input></div>
                    <div className='flex'>
                        <p className='text-2xl'>内容：</p>
                        <p className='text-2xl'>/*日記の内容*/</p>
                    </div>
                    <div>/*画像とか動画とか*/</div>
                    <div className='flex justify-evenly'>
                        <button onClick={a}><div className='flex flex-col items-center'><Image src="/upload.jpg" alt="" width={50} height={60}/><span>動画/画像を追加</span></div></button>
                        <button onClick={b}><div className='flex flex-col items-center'><Image src="/mic.png" alt="" width={50} height={60} /><span>声で入力</span></div></button>
                        <button onClick={c}><div className='flex flex-col items-center'><Image src="/check.png" alt="" width={50} height={60} /><span>日記を投稿</span></div></button>
                    </div>
                    {/* <div className='flex justify-evenly'>
                        <button><div className='flex flex-col items-center'><Image src="/upload.jpg" alt="" width={50} height={60}/><span>動画/画像を追加</span></div></button>
                        <button><div className='flex flex-col items-center'><Image src="/mic.png" alt="" width={50} height={60} /><span>声で入力</span></div></button>
                        <button><div className='flex flex-col items-center'><Image src="/check.png" alt="" width={50} height={60} /><span>日記を投稿</span></div></button>
                    </div> */}
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