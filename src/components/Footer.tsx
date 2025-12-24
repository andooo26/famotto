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
    color: isActive(path) ? '#fcdf98' : '#000',
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '-0.02em',
    fontFamily: 'inherit',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'flex-start',
    opacity: isActive(path) ? 1 : 0.7,
    flex: 1,
  });

  const diaryLinkStyle = {
    textDecoration: 'none',
    color: isActive('/diary') ? '#000' : '#666',
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '-0.02em',
    fontFamily: 'inherit',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'flex-start',
    opacity: isActive('/diary') ? 1 : 0.7,
    padding: '8px 16px',
    borderRadius: '16px',
    backgroundColor: 'rgba(252, 223, 152, 0.5)',
    flex: 1,
  };

  return (
    <footer className="footer">
      <Link href="/" style={{...linkStyle('/'), marginTop: '-16px'}}>
        <Image src="/home.png" alt="" width={90} height={90} />
        <span style={{ marginTop: '5px', whiteSpace: 'nowrap' }}>ホーム</span>
      </Link>
      <Link href="/theme" style={linkStyle('/theme')}>
        <Image src="/theme.png" alt="" width={60} height={60} />
        <span style={{ marginTop: '19px', whiteSpace: 'nowrap' }}>今日のお題</span>
      </Link>
      <Link href="/diary" style={diaryLinkStyle}>
        <Image src="/add.png" alt="" width={60} height={60} />
        <span style={{ marginTop: '19px', whiteSpace: 'nowrap' }}>日記追加</span>
      </Link>
      <Link href="/menu" style={linkStyle('/menu')}>
        <Image src="/menu.png" alt="" width={60} height={60} />
        <span style={{ marginTop: '19px', whiteSpace: 'nowrap' }}>日記確認</span>
      </Link>
      <Link href="/option" style={linkStyle('/option')}>
        <Image src="/option.png" alt="" width={60} height={60} />
        <span style={{ marginTop: '19px', whiteSpace: 'nowrap' }}>設定</span>
      </Link>
    </footer>
  );
}
