'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Scissors, Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from './login.module.css';

export default function AdminLoginPage() {
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect to admin page
    const session = localStorage.getItem('barberbook_admin_session');
    if (session === 'authenticated') {
      router.push('/admin');
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const correctPasscode = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || 'admin1234';

    setTimeout(() => {
      if (passcode === correctPasscode) {
        localStorage.setItem('barberbook_admin_session', 'authenticated');
        toast.success('Connexion réussie ! Bienvenue sur votre dashboard.');
        router.push('/admin');
      } else {
        toast.error('Code d\'accès incorrect.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className={styles.page}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.noise} />

      <div className={styles.loginContainer}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoMark}>
            <Scissors size={20} strokeWidth={2.5} />
          </div>
          <span className={styles.logoLabel}>
            Barber<span className={styles.logoAccent}>Book</span>
          </span>
        </Link>

        {/* Card */}
        <div className={`${styles.loginCard} anim-scale-in`}>
          <div className={styles.cardHeader}>
            <div className={styles.lockIconWrapper}>
              <Lock size={20} />
            </div>
            <h1 className={styles.cardTitle}>Espace Administration</h1>
            <p className={styles.cardSubtitle}>
              Veuillez saisir votre code d&apos;accès administrateur pour déverrouiller la plateforme.
            </p>
          </div>

          <form onSubmit={handleLogin} className={styles.form}>
            <div className="form-group">
              <label htmlFor="passcode" className="form-label">Code d&apos;accès secret</label>
              <div className={styles.inputWrapper}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  id="passcode"
                  type="password"
                  placeholder="••••••••"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className={`${styles.loginInput} form-input`}
                  required
                  autoFocus
                />
              </div>
              <span className={styles.helpText}>
                Indice pour le test : <code>admin1234</code>
              </span>
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-lg ${styles.submitBtn}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Vérification...
                </>
              ) : (
                <>
                  Déverrouiller
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        <div className={styles.footerNote}>
          <ShieldAlert size={14} />
          <span>Accès strictement réservé au personnel du salon.</span>
        </div>
      </div>
    </div>
  );
}
