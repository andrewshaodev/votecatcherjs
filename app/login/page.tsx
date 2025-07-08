'use client';

import { useRef } from 'react';
import { login, signup } from './actions';
import styles from '@/app/page.module.css';

export default function LoginPage() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    try {
      await signup(formData);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err && (err as { message?: string }).message === 'SIGNUP_CONFIRM_EMAIL') {
        window.alert('Please confirm your email, then login');
      } else {
        window.alert('Sign up failed. Please try again.');
      }
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.card}>
        <h1 className="text-3xl font-bold mb-4">Welcome to Votecatcher!</h1>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Login</h2>
        <form ref={formRef} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label htmlFor="email" style={{ fontWeight: 500 }}>Email:</label>
          <input id="email" name="email" type="email" required style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
          <label htmlFor="password" style={{ fontWeight: 500 }}>Password:</label>
          <input id="password" name="password" type="password" required style={{ padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }} />
          <button formAction={login} style={{ marginTop: '1rem', padding: '0.5rem', borderRadius: 4, background: '#2563eb', color: 'white', border: 'none', fontWeight: 600 }}>Log in</button>
          <button type="button" onClick={handleSignup} style={{ marginTop: '0.5rem', padding: '0.5rem', borderRadius: 4, background: '#e5e7eb', color: '#111', border: 'none', fontWeight: 600 }}>Sign up</button>
        </form>
      </div>
    </div>
  );
}