'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Scissors,
  LayoutDashboard,
  Calendar as CalendarIcon,
  Users,
  Settings as SettingsIcon,
  Plus,
  LogOut,
  Globe,
  Store,
  Clock,
  Palette,
  Save,
  RotateCcw,
  MapPin,
  Phone,
  Mail,
  Trash2,
  PlusCircle,
  Euro,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from './settings.module.css';

interface ServiceConfig {
  name: string;
  price: number;
  duration: string;
}

interface BusinessInfo {
  salonName: string;
  address: string;
  phone: string;
  email: string;
}

interface WorkingHours {
  [key: string]: { open: string; close: string; active: boolean };
}

const DEFAULT_SERVICES: ServiceConfig[] = [
  { name: 'Coupe homme', price: 25, duration: '30 min' },
  { name: 'Coupe + Barbe', price: 40, duration: '45 min' },
  { name: 'Taille de barbe', price: 18, duration: '20 min' },
  { name: 'Coloration', price: 55, duration: '60 min' },
  { name: 'Coupe enfant', price: 15, duration: '25 min' },
  { name: 'Soin capillaire', price: 30, duration: '35 min' },
  { name: 'Coupe dégradé', price: 28, duration: '35 min' },
  { name: 'Rasage classique', price: 22, duration: '25 min' },
];

const DEFAULT_HOURS: WorkingHours = {
  Lundi: { open: '09:00', close: '18:00', active: true },
  Mardi: { open: '09:00', close: '18:00', active: true },
  Mercredi: { open: '09:00', close: '18:00', active: true },
  Jeudi: { open: '09:00', close: '18:00', active: true },
  Vendredi: { open: '09:00', close: '19:00', active: true },
  Samedi: { open: '09:00', close: '17:00', active: true },
  Dimanche: { open: '09:00', close: '12:00', active: false },
};

const DEFAULT_BUSINESS: BusinessInfo = {
  salonName: 'BarberBook Studio',
  address: '12 Rue de la Coiffure, 75001 Paris',
  phone: '01 23 45 67 89',
  email: 'contact@barberbook.fr',
};

export default function SettingsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState<'business' | 'services' | 'hours' | 'appearance'>('business');

  // Settings state
  const [business, setBusiness] = useState<BusinessInfo>(DEFAULT_BUSINESS);
  const [services, setServices] = useState<ServiceConfig[]>(DEFAULT_SERVICES);
  const [hours, setHours] = useState<WorkingHours>(DEFAULT_HOURS);
  const [isDirty, setIsDirty] = useState(false);

  // Service editing
  const [editingService, setEditingService] = useState<number | null>(null);
  const [newService, setNewService] = useState<ServiceConfig | null>(null);

  // Auth guard
  useEffect(() => {
    const session = localStorage.getItem('barberbook_admin_session');
    if (session !== 'authenticated') {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Load saved settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('barberbook_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.business) setBusiness(parsed.business);
        if (parsed.services) setServices(parsed.services);
        if (parsed.hours) setHours(parsed.hours);
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('barberbook_admin_session');
    toast.success('Déconnexion réussie.');
    router.push('/admin/login');
  };

  const handleSave = () => {
    const settings = { business, services, hours };
    localStorage.setItem('barberbook_settings', JSON.stringify(settings));
    setIsDirty(false);
    toast.success('Paramètres sauvegardés avec succès !');
  };

  const handleReset = () => {
    setBusiness(DEFAULT_BUSINESS);
    setServices(DEFAULT_SERVICES);
    setHours(DEFAULT_HOURS);
    localStorage.removeItem('barberbook_settings');
    setIsDirty(false);
    toast.success('Paramètres réinitialisés par défaut.');
  };

  const updateBusiness = (field: keyof BusinessInfo, value: string) => {
    setBusiness((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const updateService = (index: number, field: keyof ServiceConfig, value: string | number) => {
    setServices((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setIsDirty(true);
  };

  const deleteService = (index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
    toast.success('Service supprimé.');
  };

  const addService = () => {
    if (newService && newService.name) {
      setServices((prev) => [...prev, newService]);
      setNewService(null);
      setIsDirty(true);
      toast.success('Service ajouté.');
    }
  };

  const updateHours = (day: string, field: 'open' | 'close' | 'active', value: string | boolean) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
    setIsDirty(true);
  };

  const SECTIONS = [
    { id: 'business' as const, label: 'Salon', icon: Store },
    { id: 'services' as const, label: 'Services', icon: Scissors },
    { id: 'hours' as const, label: 'Horaires', icon: Clock },
    { id: 'appearance' as const, label: 'Apparence', icon: Palette },
  ];

  if (!isAuthenticated) {
    return (
      <div className={styles.loadingScreen}>
        <span className={styles.spinner} />
        <p>Vérification des droits d&apos;accès...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <Link href="/" className={styles.sidebarLogo}>
            <div className={styles.logoMark}>
              <Scissors size={18} strokeWidth={2.5} />
            </div>
            <span className={styles.logoLabel}>
              Barber<span className={styles.logoAccent}>Book</span>
            </span>
          </Link>
        </div>

        <nav className={styles.sidebarNav}>
          <div className={styles.sidebarSection}>
            <span className={styles.sidebarSectionTitle}>Navigation</span>
            <Link href="/admin" className={styles.sidebarLink}>
              <LayoutDashboard size={16} />
              <span>Tableau de bord</span>
            </Link>
            <Link href="/admin" className={styles.sidebarLink}>
              <CalendarIcon size={16} />
              <span>Calendrier</span>
            </Link>
            <Link href="/admin/clients" className={styles.sidebarLink}>
              <Users size={16} />
              <span>Clients</span>
            </Link>
            <Link
              href="/admin/settings"
              className={`${styles.sidebarLink} ${styles.sidebarLinkActive}`}
            >
              <SettingsIcon size={16} />
              <span>Paramètres</span>
            </Link>
            <Link href="/reservation" className={styles.sidebarLink}>
              <Plus size={16} />
              <span>Nouveau RDV</span>
            </Link>
          </div>

          <div className={styles.sidebarSection} style={{ marginTop: 'auto' }}>
            <button onClick={handleLogout} className={`${styles.sidebarLink} ${styles.logoutBtn}`}>
              <LogOut size={16} />
              <span>Se déconnecter</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.topbar}>
          <div>
            <span className={styles.premiumTag}>Configuration</span>
            <h1 className={styles.pageTitle}>Paramètres du salon</h1>
            <p className={styles.pageSubtitle}>
              Configurez les informations de votre salon, les services proposés et vos horaires d&apos;ouverture.
            </p>
          </div>
          <div className={styles.topActions}>
            {isDirty && (
              <button onClick={handleReset} className="btn btn-ghost btn-sm">
                <RotateCcw size={15} />
                Réinitialiser
              </button>
            )}
            <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={!isDirty}>
              <Save size={15} />
              Enregistrer
            </button>
            <Link href="/" className="btn btn-ghost btn-sm">
              <Globe size={15} />
              Voir le site
            </Link>
          </div>
        </header>

        {/* Settings Layout */}
        <div className={styles.settingsLayout}>
          {/* Settings Tabs */}
          <div className={styles.settingsTabs}>
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`${styles.settingsTab} ${activeSection === sec.id ? styles.settingsTabActive : ''}`}
              >
                <sec.icon size={16} />
                <span>{sec.label}</span>
              </button>
            ))}
          </div>

          {/* Settings Content */}
          <div className={styles.settingsContent}>
            {/* ====== BUSINESS INFO ====== */}
            {activeSection === 'business' && (
              <div className={`${styles.settingsPanel} anim-fade-up`}>
                <div className={styles.panelHeader}>
                  <Store size={20} className={styles.panelIcon} />
                  <div>
                    <h2 className={styles.panelTitle}>Informations du salon</h2>
                    <p className={styles.panelDesc}>
                      Modifiez les informations principales de votre établissement.
                    </p>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={`form-group ${styles.formCol2}`}>
                    <label className="form-label">Nom du salon</label>
                    <div className={styles.inputWrapper}>
                      <Store size={16} className={styles.inputIcon} />
                      <input
                        type="text"
                        className={`form-input ${styles.inputWithIcon}`}
                        value={business.salonName}
                        onChange={(e) => updateBusiness('salonName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={`form-group ${styles.formCol2}`}>
                    <label className="form-label">Adresse</label>
                    <div className={styles.inputWrapper}>
                      <MapPin size={16} className={styles.inputIcon} />
                      <input
                        type="text"
                        className={`form-input ${styles.inputWithIcon}`}
                        value={business.address}
                        onChange={(e) => updateBusiness('address', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Téléphone</label>
                    <div className={styles.inputWrapper}>
                      <Phone size={16} className={styles.inputIcon} />
                      <input
                        type="tel"
                        className={`form-input ${styles.inputWithIcon}`}
                        value={business.phone}
                        onChange={(e) => updateBusiness('phone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email de contact</label>
                    <div className={styles.inputWrapper}>
                      <Mail size={16} className={styles.inputIcon} />
                      <input
                        type="email"
                        className={`form-input ${styles.inputWithIcon}`}
                        value={business.email}
                        onChange={(e) => updateBusiness('email', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ====== SERVICES MANAGEMENT ====== */}
            {activeSection === 'services' && (
              <div className={`${styles.settingsPanel} anim-fade-up`}>
                <div className={styles.panelHeader}>
                  <Scissors size={20} className={styles.panelIcon} />
                  <div>
                    <h2 className={styles.panelTitle}>Gestion des services</h2>
                    <p className={styles.panelDesc}>
                      Ajoutez, modifiez ou supprimez les prestations proposées dans votre salon.
                    </p>
                  </div>
                </div>

                <div className={styles.servicesList}>
                  {services.map((srv, idx) => (
                    <div key={idx} className={styles.serviceItem}>
                      {editingService === idx ? (
                        <div className={styles.serviceEditRow}>
                          <input
                            type="text"
                            className={`form-input ${styles.serviceEditInput}`}
                            value={srv.name}
                            onChange={(e) => updateService(idx, 'name', e.target.value)}
                            placeholder="Nom du service"
                          />
                          <div className={styles.serviceEditSmall}>
                            <input
                              type="number"
                              className={`form-input ${styles.serviceEditInput}`}
                              value={srv.price}
                              onChange={(e) => updateService(idx, 'price', Number(e.target.value))}
                              placeholder="Prix"
                              min="0"
                            />
                            <input
                              type="text"
                              className={`form-input ${styles.serviceEditInput}`}
                              value={srv.duration}
                              onChange={(e) => updateService(idx, 'duration', e.target.value)}
                              placeholder="Durée"
                            />
                          </div>
                          <button
                            onClick={() => setEditingService(null)}
                            className={styles.serviceActionBtn}
                            title="Terminé"
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className={styles.serviceInfo}>
                            <span className={styles.serviceItemName}>{srv.name}</span>
                            <span className={styles.serviceItemMeta}>
                              {srv.duration}
                            </span>
                          </div>
                          <span className={styles.serviceItemPrice}>{srv.price} €</span>
                          <div className={styles.serviceActions}>
                            <button
                              onClick={() => setEditingService(idx)}
                              className={styles.serviceActionBtn}
                              title="Modifier"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => deleteService(idx)}
                              className={`${styles.serviceActionBtn} ${styles.serviceDeleteBtn}`}
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Add new service */}
                  {newService ? (
                    <div className={`${styles.serviceItem} ${styles.serviceItemNew}`}>
                      <div className={styles.serviceEditRow}>
                        <input
                          type="text"
                          className={`form-input ${styles.serviceEditInput}`}
                          value={newService.name}
                          onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                          placeholder="Nom du service"
                          autoFocus
                        />
                        <div className={styles.serviceEditSmall}>
                          <input
                            type="number"
                            className={`form-input ${styles.serviceEditInput}`}
                            value={newService.price || ''}
                            onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                            placeholder="Prix"
                            min="0"
                          />
                          <input
                            type="text"
                            className={`form-input ${styles.serviceEditInput}`}
                            value={newService.duration}
                            onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                            placeholder="ex: 30 min"
                          />
                        </div>
                        <button onClick={addService} className={styles.serviceActionBtn} title="Ajouter">
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setNewService(null)}
                          className={`${styles.serviceActionBtn} ${styles.serviceDeleteBtn}`}
                          title="Annuler"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setNewService({ name: '', price: 0, duration: '30 min' })}
                      className={styles.addServiceBtn}
                    >
                      <PlusCircle size={16} />
                      Ajouter un service
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ====== WORKING HOURS ====== */}
            {activeSection === 'hours' && (
              <div className={`${styles.settingsPanel} anim-fade-up`}>
                <div className={styles.panelHeader}>
                  <Clock size={20} className={styles.panelIcon} />
                  <div>
                    <h2 className={styles.panelTitle}>Horaires d&apos;ouverture</h2>
                    <p className={styles.panelDesc}>
                      Définissez les jours et heures d&apos;ouverture de votre salon.
                    </p>
                  </div>
                </div>

                <div className={styles.hoursList}>
                  {Object.entries(hours).map(([day, config]) => (
                    <div key={day} className={`${styles.hoursRow} ${!config.active ? styles.hoursRowInactive : ''}`}>
                      <div className={styles.hoursDayInfo}>
                        <button
                          onClick={() => updateHours(day, 'active', !config.active)}
                          className={`${styles.hoursToggle} ${config.active ? styles.hoursToggleOn : ''}`}
                        >
                          <span className={styles.hoursToggleThumb} />
                        </button>
                        <span className={styles.hoursDayName}>{day}</span>
                      </div>

                      {config.active ? (
                        <div className={styles.hoursInputs}>
                          <input
                            type="time"
                            value={config.open}
                            onChange={(e) => updateHours(day, 'open', e.target.value)}
                            className={`form-input ${styles.hoursTimeInput}`}
                          />
                          <span className={styles.hoursSeparator}>à</span>
                          <input
                            type="time"
                            value={config.close}
                            onChange={(e) => updateHours(day, 'close', e.target.value)}
                            className={`form-input ${styles.hoursTimeInput}`}
                          />
                        </div>
                      ) : (
                        <span className={styles.hoursClosedLabel}>Fermé</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ====== APPEARANCE ====== */}
            {activeSection === 'appearance' && (
              <div className={`${styles.settingsPanel} anim-fade-up`}>
                <div className={styles.panelHeader}>
                  <Palette size={20} className={styles.panelIcon} />
                  <div>
                    <h2 className={styles.panelTitle}>Apparence</h2>
                    <p className={styles.panelDesc}>
                      Personnalisez l&apos;apparence de votre plateforme de réservation.
                    </p>
                  </div>
                </div>

                <div className={styles.appearanceGrid}>
                  <div className={styles.themeCard}>
                    <div className={styles.themePreview} style={{ background: 'linear-gradient(135deg, #f37318, #e4590e)' }} />
                    <div className={styles.themeInfo}>
                      <span className={styles.themeName}>Orange (Défaut)</span>
                      <span className={styles.themeCheck}><Check size={14} /></span>
                    </div>
                  </div>
                  <div className={`${styles.themeCard} ${styles.themeDisabled}`}>
                    <div className={styles.themePreview} style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }} />
                    <div className={styles.themeInfo}>
                      <span className={styles.themeName}>Bleu</span>
                      <span className={styles.themeComingSoon}>Bientôt</span>
                    </div>
                  </div>
                  <div className={`${styles.themeCard} ${styles.themeDisabled}`}>
                    <div className={styles.themePreview} style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }} />
                    <div className={styles.themeInfo}>
                      <span className={styles.themeName}>Vert</span>
                      <span className={styles.themeComingSoon}>Bientôt</span>
                    </div>
                  </div>
                  <div className={`${styles.themeCard} ${styles.themeDisabled}`}>
                    <div className={styles.themePreview} style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }} />
                    <div className={styles.themeInfo}>
                      <span className={styles.themeName}>Violet</span>
                      <span className={styles.themeComingSoon}>Bientôt</span>
                    </div>
                  </div>
                </div>

                <div className={styles.appearanceNote}>
                  <Palette size={14} />
                  <span>Les thèmes personnalisés arrivent prochainement. Restez connecté !</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Bar */}
      <nav className={styles.mobileBar}>
        <Link href="/admin" className={styles.mobileBarLink}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>
        <Link href="/admin/clients" className={styles.mobileBarLink}>
          <Users size={18} />
          <span>Clients</span>
        </Link>
        <Link href="/admin/settings" className={`${styles.mobileBarLink} ${styles.mobileBarLinkActive}`}>
          <SettingsIcon size={18} />
          <span>Paramètres</span>
        </Link>
        <button onClick={handleLogout} className={styles.mobileBarLink}>
          <LogOut size={18} />
          <span>Quitter</span>
        </button>
      </nav>
    </div>
  );
}
