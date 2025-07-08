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
        <h2>Login</h2>
        <form ref={formRef}>
          <label htmlFor="email">Email:</label>
          <input id="email" name="email" type="email" required />
          <label htmlFor="password">Password:</label>
          <input id="password" name="password" type="password" required />
          <button formAction={login}>Log in</button>
          <button type="button" onClick={handleSignup}>Sign up</button>
        </form>
      </div>
    </div>
  );
}