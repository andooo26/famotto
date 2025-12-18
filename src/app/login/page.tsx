// import { signIn } from "@/auth"

// export default function LoginPage() {
//   return (
//     <div>
//       <h1>Famottoにログイン</h1>
//       <form
//         action={async () => {
//           "use server"
//           await signIn("google")
//         }}
//       >
//         <button type="submit">
//           Google でサインイン
//         </button>
//       </form>
//     </div>
//   )
// }
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithGoogle } from '@/lib/auth';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleGoogleSignIn = async () => {
        try {
        setLoading(true);
        setError(null);
        await signInWithGoogle();
        router.push('/');
        } catch (err: any) {
        setError(err.message);
        console.error('Login error:', err);
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="page-container"
        style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f7e5c3ff 0%, #f7e5c3ff 100%)',
            margin: 0,
            padding: 0
        }}
        >
        {/* 背景の浮遊球体 */}
        <div className="floating-spheres">
            <div className="sphere"></div>
            <div className="sphere"></div>
            <div className="sphere"></div>
            <div className="sphere"></div>
            <div className="sphere"></div>
            <div className="sphere"></div>
            <div className="sphere"></div>
            <div className="sphere"></div>
            <div className="sphere"></div>
            <div className="sphere"></div>
        </div>
        
        <div
            style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            width: '100%',
            maxWidth: 420,
            position: 'relative',
            zIndex: 1,
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '3rem 2rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            }}
        >
            <h1 style={{ 
                fontSize: '3.5rem', 
                margin: 0, 
                color: '#fcdf98',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                fontFamily: 'inherit'
            }}>
            Famotto
            </h1>
            <h2 style={{
                fontSize: '1.25rem',
                margin: 0,
                color: '#666',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                lineHeight: '1.6',
                fontFamily: 'inherit'
            }}>
                ファミリーの<br></br>コミュニケーションをもっと
            </h2>

            {error && (
                <div style={{ 
                    color: '#e74c3c', 
                    padding: '0.75rem', 
                    backgroundColor: '#fee',
                    borderRadius: '8px',
                    width: '100%'
                }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: loading ? 'wait' : 'pointer',
                }}
            >
                <img
                src="/signupwithgoogle.png"
                alt="Google でサインイン"
                style={{
                    width: 200,
                    height: 200,
                    opacity: loading ? 0.5 : 1,
                    objectFit: 'contain',
                    display: 'block',
                }}
                />
            </button>
            </div>
        </div>
        </div>
    );
}