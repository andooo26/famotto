'use client';

import Image from 'next/image';
import Link from 'next/link';

interface HeaderProps {
  iconUrl?: string;
  showLogout?: boolean;
  onLogout?: () => void;
}

export default function Header({ iconUrl = "/icon.jpg", showLogout = false, onLogout }: HeaderProps) {
  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="profile-icon">
          <Image
            src={iconUrl}
            alt="プロフィール"
            width={40}
            height={40}
            style={{ borderRadius: '50%' }}
          />
        </div>
        <Link href="/">
          <span>Famotto</span>
        </Link>
      </div>
      {showLogout && onLogout && (
        <button
          onClick={onLogout}
          style={{
            background: 'none',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#333',
          }}
        >
          ログアウト
        </button>
      )}
    </header>
  );
}
