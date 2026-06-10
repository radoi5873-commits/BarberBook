'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Scissors,
  Calendar,
  Clock,
  Users,
  Star,
  ArrowRight,
  CheckCircle2,
  Zap,
  Smartphone,
  BarChart3,
  Shield,
  Sparkles,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import styles from './page.module.css';

const FEATURES = [
  {
    icon: Zap,
    title: 'Réservation instantanée',
    desc: 'Vos clients réservent en 30 secondes. Pas d\'appel, pas d\'attente.',
    color: '#f37318',
  },
  {
    icon: Smartphone,
    title: 'Mobile-first',
    desc: 'Interface parfaite sur tous les appareils. Vos clients réservent depuis leur téléphone.',
    color: '#3b82f6',
  },
  {
    icon: BarChart3,
    title: 'Dashboard analytique',
    desc: 'Statistiques en temps réel. Visualisez vos rendez-vous et optimisez votre planning.',
    color: '#10b981',
  },
  {
    icon: Shield,
    title: 'Données sécurisées',
    desc: 'Infrastructure cloud sécurisée avec Supabase. Vos données sont protégées.',
    color: '#8b5cf6',
  },
  {
    icon: Calendar,
    title: 'Gestion intelligente',
    desc: 'Confirmez, annulez ou reprogrammez d\'un simple clic depuis votre dashboard.',
    color: '#ec4899',
  },
  {
    icon: Sparkles,
    title: 'Expérience premium',
    desc: 'Un design professionnel qui reflète la qualité de votre salon et fidélise vos clients.',
    color: '#f59e0b',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Choisissez un service',
    desc: 'Coupe, barbe, coloration... Sélectionnez le soin qui vous convient.',
    icon: Scissors,
  },
  {
    num: '02',
    title: 'Réservez un créneau',
    desc: 'Choisissez la date et l\'heure dans notre planning en temps réel.',
    icon: Clock,
  },
  {
    num: '03',
    title: 'Confirmation immédiate',
    desc: 'Recevez votre confirmation. Votre barbier vous attend !',
    icon: CheckCircle2,
  },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={styles.page}>
      {/* ========== NAVBAR ========== */}
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
        <div className={`container ${styles.navInner}`}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoMark}>
              <Scissors size={18} strokeWidth={2.5} />
            </div>
            <span className={styles.logoLabel}>
              Barber<span className={styles.logoAccent}>Book</span>
            </span>
          </Link>

          <div className={styles.navCenter}>
            <a href="#features" className={styles.navLink}>Fonctionnalités</a>
            <a href="#how" className={styles.navLink}>Comment ça marche</a>
            <Link href="/admin" className={styles.navLink}>Dashboard</Link>
          </div>

          <div className={styles.navRight}>
            <Link href="/reservation" className="btn btn-primary btn-sm">
              Réserver
              <ArrowRight size={14} />
            </Link>
          </div>

          <button
            className={styles.mobileToggle}
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Menu"
          >
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className={styles.mobileMenu}>
            <a href="#features" className={styles.mobileLink} onClick={() => setMobileMenu(false)}>
              Fonctionnalités
            </a>
            <a href="#how" className={styles.mobileLink} onClick={() => setMobileMenu(false)}>
              Comment ça marche
            </a>
            <Link href="/admin" className={styles.mobileLink} onClick={() => setMobileMenu(false)}>
              Dashboard
            </Link>
            <Link href="/reservation" className="btn btn-primary" onClick={() => setMobileMenu(false)}>
              Réserver maintenant
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </nav>

      {/* ========== HERO ========== */}
      <section className={styles.hero}>
        <div className={styles.heroOrb1} />
        <div className={styles.heroOrb2} />
        <div className={styles.heroOrb3} />
        <div className={styles.heroNoise} />

        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroPill}>
            <Sparkles size={13} />
            <span>Nouveau — Réservation en ligne ouverte</span>
            <ChevronRight size={13} />
          </div>

          <h1 className={styles.heroTitle}>
            Gérez vos rendez-vous
            <br />
            <span className={styles.heroGradient}>comme un pro.</span>
          </h1>

          <p className={styles.heroDesc}>
            BarberBook est la plateforme de réservation moderne pour les barbiers 
            et salons de coiffure. Simple, rapide, professionnel.
          </p>

          <div className={styles.heroCtas}>
            <Link href="/reservation" className="btn btn-primary btn-xl">
              Prendre rendez-vous
              <ArrowRight size={16} />
            </Link>
            <a href="#features" className="btn btn-secondary btn-xl">
              Découvrir
            </a>
          </div>

          <div className={styles.heroSocial}>
            <div className={styles.heroAvatars}>
              {['J', 'M', 'A', 'S'].map((l, i) => (
                <div
                  key={i}
                  className={styles.heroAvatar}
                  style={{ zIndex: 4 - i }}
                >
                  {l}
                </div>
              ))}
            </div>
            <div className={styles.heroSocialText}>
              <div className={styles.heroStars}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <span>Plus de 500 clients satisfaits</span>
            </div>
          </div>
        </div>

        {/* Hero Visual — Floating Dashboard Preview */}
        <div className={`container ${styles.heroVisual}`}>
          <div className={styles.heroCard}>
            <div className={styles.heroCardBar}>
              <div className={styles.heroCardDots}>
                <span /><span /><span />
              </div>
              <span className={styles.heroCardTitle}>Dashboard BarberBook</span>
              <div />
            </div>
            <div className={styles.heroCardBody}>
              <div className={styles.heroMiniStats}>
                {[
                  { label: 'Aujourd\'hui', value: '12', color: 'var(--brand-500)' },
                  { label: 'Confirmés', value: '8', color: 'var(--success-500)' },
                  { label: 'En attente', value: '4', color: 'var(--warning-500)' },
                ].map((s, i) => (
                  <div key={i} className={styles.heroMiniStat}>
                    <span className={styles.heroMiniStatVal} style={{ color: s.color }}>{s.value}</span>
                    <span className={styles.heroMiniStatLabel}>{s.label}</span>
                  </div>
                ))}
              </div>
              <div className={styles.heroMiniRows}>
                {[
                  { name: 'Thomas D.', service: 'Coupe + Barbe', time: '09:00', status: 'Confirmé' },
                  { name: 'Marc L.', service: 'Dégradé', time: '10:30', status: 'En attente' },
                  { name: 'Sarah K.', service: 'Coloration', time: '14:00', status: 'Confirmé' },
                ].map((r, i) => (
                  <div key={i} className={styles.heroMiniRow}>
                    <div className={styles.heroMiniAvatar}>{r.name[0]}</div>
                    <span className={styles.heroMiniName}>{r.name}</span>
                    <span className={styles.heroMiniService}>{r.service}</span>
                    <span className={styles.heroMiniTime}>{r.time}</span>
                    <span className={`${styles.heroMiniBadge} ${r.status === 'Confirmé' ? styles.heroMiniBadgeOk : styles.heroMiniBadgeWait}`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== LOGOS / TRUST ========== */}
      <section className={styles.trust}>
        <div className="container">
          <p className={styles.trustLabel}>Propulsé par des technologies de confiance</p>
          <div className={styles.trustLogos}>
            {['Next.js', 'React', 'Supabase', 'Vercel', 'TypeScript'].map((t) => (
              <span key={t} className={styles.trustLogo}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section id="features" className={styles.features}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className={styles.sectionPill}>Fonctionnalités</span>
            <h2 className={styles.sectionTitle}>
              Tout ce qu&apos;il faut pour gérer<br />
              votre salon efficacement
            </h2>
            <p className={styles.sectionDesc}>
              Des outils puissants et simples, conçus pour les professionnels de la coiffure.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={`${styles.featureCard} anim-fade-up anim-d${i + 1}`}>
                <div className={styles.featureIcon} style={{ background: `${f.color}10`, color: f.color }}>
                  <f.icon size={20} strokeWidth={2} />
                </div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how" className={styles.how}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className={styles.sectionPill}>Comment ça marche</span>
            <h2 className={styles.sectionTitle}>
              Réservez en 3 étapes simples
            </h2>
            <p className={styles.sectionDesc}>
              Un processus fluide, du choix du service à la confirmation.
            </p>
          </div>

          <div className={styles.stepsRow}>
            {STEPS.map((s, i) => (
              <div key={i} className={styles.stepCard}>
                <div className={styles.stepTop}>
                  <span className={styles.stepNum}>{s.num}</span>
                  {i < 2 && <div className={styles.stepLine} />}
                </div>
                <div className={styles.stepIconWrap}>
                  <s.icon size={24} strokeWidth={1.8} />
                </div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className={styles.cta}>
        <div className="container">
          <div className={styles.ctaBox}>
            <div className={styles.ctaOrb} />
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>
                Prêt à moderniser votre salon ?
              </h2>
              <p className={styles.ctaDesc}>
                Rejoignez des centaines de barbiers qui utilisent BarberBook pour gérer
                leurs rendez-vous simplement.
              </p>
              <div className={styles.ctaButtons}>
                <Link href="/reservation" className="btn btn-primary btn-xl">
                  <Scissors size={16} />
                  Commencer gratuitement
                </Link>
                <Link href="/admin" className="btn btn-secondary btn-xl">
                  Voir le dashboard
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <div className={styles.footerLeft}>
            <div className={styles.logo}>
              <div className={styles.logoMark}>
                <Scissors size={18} strokeWidth={2.5} />
              </div>
              <span className={styles.logoLabel}>
                Barber<span className={styles.logoAccent}>Book</span>
              </span>
            </div>
            <p className={styles.footerTagline}>
              La plateforme de réservation moderne pour les barbiers et salons de coiffure.
            </p>
          </div>

          <div className={styles.footerCols}>
            <div className={styles.footerCol}>
              <h4 className={styles.footerColTitle}>Produit</h4>
              <Link href="/">Accueil</Link>
              <Link href="/reservation">Réservation</Link>
              <Link href="/admin">Dashboard</Link>
            </div>
            <div className={styles.footerCol}>
              <h4 className={styles.footerColTitle}>Légal</h4>
              <a href="#">Mentions légales</a>
              <a href="#">Confidentialité</a>
              <a href="#">CGU</a>
            </div>
          </div>
        </div>

        <div className={styles.footerBar}>
          <div className="container">
            <span>© {new Date().getFullYear()} BarberBook. Tous droits réservés.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
