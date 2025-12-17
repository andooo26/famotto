'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const linkStyle = (path: string) => ({
    textDecoration: 'none',
    color: isActive(path) ? '#f4d03f' : '#000',
    fontSize: '14px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    opacity: isActive(path) ? 1 : 0.7,
  });

  const diaryLinkStyle = {
    textDecoration: 'none',
    color: isActive('/diary') ? '#f4d03f' : '#000',
    fontSize: '14px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    opacity: isActive('/diary') ? 1 : 0.7,
    padding: '8px 16px',
    borderRadius: '16px',
    backgroundColor: 'rgba(244, 208, 63, 0.3)',
  };

  return (
    <footer className="footer">
      <Link href="/" style={linkStyle('/')}>
        <Image src="/home.png" alt="" width={60} height={60} />
        <span>ホーム</span>
      </Link>
      <Link href="/theme" style={linkStyle('/theme')}>
        <Image src="/theme.png" alt="" width={60} height={60} />
        <span>今日のお題</span>
      </Link>
      <Link href="/diary" style={diaryLinkStyle}>
        <Image src="/add.png" alt="" width={60} height={60} />
        <span>日記追加</span>
      </Link>
      <Link href="/menu" style={linkStyle('/menu')}>
        <Image src="/menu.png" alt="" width={60} height={60} />
        <span>日記確認</span>
      </Link>
      <Link href="/option" style={linkStyle('/option')}>
        <Image src="/option.png" alt="" width={60} height={60} />
        <span>設定</span>
      </Link>
    </footer>
  );
}
