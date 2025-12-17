'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <Link href="/">
        <Image src="/home.png" alt="" width={60} height={60} />
        <span>ホーム</span>
      </Link>
      <Link href="/diary">
        <Image src="/add.png" alt="" width={60} height={60} />
        <span>日記追加</span>
      </Link>
      <Link href="/theme">
        <Image src="/theme.png" alt="" width={60} height={60} />
        <span>今日のお題</span>
      </Link>
      <Link href="/menu">
        <Image src="/menu.png" alt="" width={60} height={60} />
        <span>日記確認</span>
      </Link>
      <Link href="/option">
        <Image src="/option.png" alt="" width={60} height={60} />
        <span>設定</span>
      </Link>
    </footer>
  );
}
