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
      {/* PC版: 左にFamotto、中央にタイトル、右にログアウト */}
      <div className="header-pc" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Link href="/">
          <span style={{ 
            fontSize: '32px', 
            color: '#fcdf98',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            fontFamily: 'inherit'
          }}>Famotto</span>
        </Link>
      </div>
      {title && (
        <div className="header-title-pc" style={{ 
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
          className="header-logout-pc"
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
        <div className="header-spacer-pc" style={{ width: '100px' }}></div>
      )}
      
      {/* スマホ版: 中央にFamotto、右にタイトル */}
      <div className="header-mobile" style={{ display: 'none', position: 'relative', width: '100%', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <Link href="/">
            <span style={{ 
              fontSize: '28px', 
              color: '#fcdf98',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              fontFamily: 'inherit'
            }}>Famotto</span>
          </Link>
        </div>
        {title && (
          <div style={{ 
            position: 'absolute',
            right: '16px',
            fontSize: '14px',
            color: '#666',
            fontWeight: 500
          }}>
            {title}
          </div>
        )}
      </div>
    </header>
  );
}
