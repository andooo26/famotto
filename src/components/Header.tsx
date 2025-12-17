'use client';

import Link from 'next/link';

interface HeaderProps {
  title?: string;
  showLogout?: boolean;
  onLogout?: () => void;
}

export default function Header({ title, showLogout = false, onLogout }: HeaderProps) {
  return (
    <header className="header" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Link href="/">
          <span style={{ fontSize: '32px', color: '#e8d4b0' }}>Famotto</span>
        </Link>
      </div>
      {title && (
        <div style={{ 
          position: 'absolute', 
          left: '50%', 
          transform: 'translateX(-50%)',
          fontSize: '24px',
          color: '#666'
        }}>
          {title}
        </div>
      )}
      {showLogout && onLogout ? (
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
      ) : (
        <div style={{ width: '100px' }}></div>
      )}
    </header>
  );
}
