'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Appointment } from '@/types';
import {
  Scissors,
  LayoutDashboard,
  Calendar as CalendarIcon,
  Users,
  Settings,
  Globe,
  Plus,
  Search,
  LogOut,
  Mail,
  Phone,
  Star,
  TrendingUp,
  Euro,
  ChevronRight,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from './clients.module.css';

// Service prices for revenue computation
const SERVICE_PRICES: Record<string, number> = {
  'Coupe homme': 25,
  'Coupe + Barbe': 40,
  'Taille de barbe': 18,
  'Coloration': 55,
  'Coupe enfant': 15,
  'Soin capillaire': 30,
  'Coupe dégradé': 28,
  'Rasage classique': 22,
};

interface ClientData {
  email: string;
  full_name: string;
  phone: string;
  totalVisits: number;
  confirmedVisits: number;
  totalSpent: number;
  favoriteService: string;
  lastVisit: string;
  firstVisit: string;
  appointments: Appointment[];
}

export default function ClientsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);

  // Auth guard
  useEffect(() => {
    const session = localStorage.getItem('barberbook_admin_session');
    if (session !== 'authenticated') {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('barberbook_admin_session');
    toast.success('Déconnexion réussie.');
    router.push('/admin/login');
  };

  const fetchAppointments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAppointments((data as Appointment[]) || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      toast.error('Erreur de chargement des données clients.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated, fetchAppointments]);

  // Build client database from appointments
  const clients = useMemo(() => {
    const clientMap: Record<string, ClientData> = {};

    appointments.forEach((apt) => {
      const key = apt.email.toLowerCase();
      if (!clientMap[key]) {
        clientMap[key] = {
          email: apt.email,
          full_name: apt.full_name,
          phone: apt.phone,
          totalVisits: 0,
          confirmedVisits: 0,
          totalSpent: 0,
          favoriteService: '',
          lastVisit: apt.date,
          firstVisit: apt.date,
          appointments: [],
        };
      }

      const client = clientMap[key];
      client.totalVisits++;
      client.appointments.push(apt);

      if (apt.status === 'confirme') {
        client.confirmedVisits++;
        client.totalSpent += SERVICE_PRICES[apt.service] || 20;
      }

      // Track latest name/phone
      client.full_name = apt.full_name || client.full_name;
      client.phone = apt.phone || client.phone;

      if (apt.date > client.lastVisit) client.lastVisit = apt.date;
      if (apt.date < client.firstVisit) client.firstVisit = apt.date;
    });

    // Compute favorite service
    Object.values(clientMap).forEach((client) => {
      const serviceCounts: Record<string, number> = {};
      client.appointments.forEach((a) => {
        serviceCounts[a.service] = (serviceCounts[a.service] || 0) + 1;
      });
      const sorted = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]);
      client.favoriteService = sorted[0]?.[0] || 'N/A';
    });

    return Object.values(clientMap).sort((a, b) => b.totalVisits - a.totalVisits);
  }, [appointments]);

  const filteredClients = useMemo(() => {
    if (!searchQuery) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  }, [clients, searchQuery]);

  const globalStats = useMemo(() => {
    const totalClients = clients.length;
    const avgVisits = totalClients > 0
      ? (clients.reduce((s, c) => s + c.totalVisits, 0) / totalClients).toFixed(1)
      : '0';
    const totalRevenue = clients.reduce((s, c) => s + c.totalSpent, 0);
    const loyalClients = clients.filter((c) => c.confirmedVisits >= 3).length;

    return { totalClients, avgVisits, totalRevenue, loyalClients };
  }, [clients]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

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
            <Link
              href="/admin/clients"
              className={`${styles.sidebarLink} ${styles.sidebarLinkActive}`}
            >
              <Users size={16} />
              <span>Clients</span>
              <span className={styles.sidebarBadge}>{clients.length}</span>
            </Link>
            <Link href="/admin/settings" className={styles.sidebarLink}>
              <Settings size={16} />
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

      {/* Main Panel */}
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.topbar}>
          <div>
            <span className={styles.premiumTag}>Gestion Clients</span>
            <h1 className={styles.pageTitle}>Base de données clients</h1>
            <p className={styles.pageSubtitle}>
              Consultez l&apos;historique et les statistiques de vos clients fidèles.
            </p>
          </div>
          <div className={styles.topActions}>
            <Link href="/" className="btn btn-ghost btn-sm">
              <Globe size={15} />
              Voir le site
            </Link>
          </div>
        </header>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} anim-fade-up anim-d1`}>
            <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6' }}>
              <Users size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{globalStats.totalClients}</span>
              <span className={styles.statLabel}>Clients uniques</span>
            </div>
          </div>
          <div className={`${styles.statCard} anim-fade-up anim-d2`}>
            <div className={styles.statIcon} style={{ background: 'rgba(243, 115, 24, 0.08)', color: 'var(--brand-500)' }}>
              <TrendingUp size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{globalStats.avgVisits}</span>
              <span className={styles.statLabel}>Visites / client</span>
            </div>
          </div>
          <div className={`${styles.statCard} anim-fade-up anim-d3`}>
            <div className={styles.statIcon} style={{ background: 'var(--success-50)', color: 'var(--success-600)' }}>
              <Euro size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{globalStats.totalRevenue} €</span>
              <span className={styles.statLabel}>Chiffre d&apos;affaires</span>
            </div>
          </div>
          <div className={`${styles.statCard} anim-fade-up anim-d4`}>
            <div className={styles.statIcon} style={{ background: 'rgba(139, 92, 246, 0.08)', color: '#8b5cf6' }}>
              <Star size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{globalStats.loyalClients}</span>
              <span className={styles.statLabel}>Clients fidèles (3+)</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={styles.contentSplit}>
          {/* Client List */}
          <div className={styles.clientListPanel}>
            <div className={styles.listToolbar}>
              <div className={styles.searchWrapper}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Rechercher un client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <span className={styles.resultCount}>
                {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className={styles.loadingState}>
                <span className={styles.spinner} />
                <p>Chargement des clients...</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className={styles.emptyState}>
                <Users size={32} />
                <p>Aucun client trouvé</p>
              </div>
            ) : (
              <div className={styles.clientList}>
                {filteredClients.map((client, idx) => (
                  <button
                    key={client.email}
                    onClick={() => setSelectedClient(client)}
                    className={`${styles.clientRow} ${selectedClient?.email === client.email ? styles.clientRowSelected : ''} anim-fade-up`}
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <div className={styles.clientAvatar}>
                      {client.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.clientInfo}>
                      <span className={styles.clientName}>{client.full_name}</span>
                      <span className={styles.clientEmail}>{client.email}</span>
                    </div>
                    <div className={styles.clientMeta}>
                      <span className={styles.visitBadge}>{client.totalVisits} visite{client.totalVisits !== 1 ? 's' : ''}</span>
                      <ChevronRight size={14} className={styles.chevron} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Client Detail Panel */}
          <div className={styles.clientDetailPanel}>
            {!selectedClient ? (
              <div className={styles.detailEmpty}>
                <div className={styles.detailEmptyIcon}>
                  <Users size={28} />
                </div>
                <p className={styles.detailEmptyTitle}>Sélectionnez un client</p>
                <p className={styles.detailEmptyText}>
                  Cliquez sur un client dans la liste pour voir son profil détaillé et son historique.
                </p>
              </div>
            ) : (
              <div className={styles.detailContent}>
                {/* Profile Header */}
                <div className={styles.profileHeader}>
                  <div className={styles.profileAvatar}>
                    {selectedClient.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.profileInfo}>
                    <h2 className={styles.profileName}>{selectedClient.full_name}</h2>
                    <div className={styles.profileContact}>
                      <span><Mail size={13} /> {selectedClient.email}</span>
                      <span><Phone size={13} /> {selectedClient.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Mini Stats */}
                <div className={styles.miniStatsGrid}>
                  <div className={styles.miniStat}>
                    <span className={styles.miniStatValue}>{selectedClient.totalVisits}</span>
                    <span className={styles.miniStatLabel}>Total visites</span>
                  </div>
                  <div className={styles.miniStat}>
                    <span className={styles.miniStatValue}>{selectedClient.confirmedVisits}</span>
                    <span className={styles.miniStatLabel}>Confirmées</span>
                  </div>
                  <div className={styles.miniStat}>
                    <span className={styles.miniStatValue}>{selectedClient.totalSpent} €</span>
                    <span className={styles.miniStatLabel}>Dépensé</span>
                  </div>
                </div>

                {/* Favorite Service */}
                <div className={styles.detailSection}>
                  <h3 className={styles.detailSectionTitle}>
                    <Star size={14} /> Service favori
                  </h3>
                  <div className={styles.favoriteCard}>
                    <span className={styles.favoriteName}>{selectedClient.favoriteService}</span>
                    <span className={styles.favoritePrice}>
                      {SERVICE_PRICES[selectedClient.favoriteService] || 20} €
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div className={styles.detailSection}>
                  <h3 className={styles.detailSectionTitle}>
                    <Clock size={14} /> Dates clés
                  </h3>
                  <div className={styles.timelineRow}>
                    <span className={styles.timelineLabel}>Première visite</span>
                    <span className={styles.timelineValue}>{formatDate(selectedClient.firstVisit)}</span>
                  </div>
                  <div className={styles.timelineRow}>
                    <span className={styles.timelineLabel}>Dernière visite</span>
                    <span className={styles.timelineValue}>{formatDate(selectedClient.lastVisit)}</span>
                  </div>
                </div>

                {/* Appointment History */}
                <div className={styles.detailSection}>
                  <h3 className={styles.detailSectionTitle}>
                    <CalendarIcon size={14} /> Historique des RDV
                  </h3>
                  <div className={styles.historyList}>
                    {selectedClient.appointments
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .slice(0, 8)
                      .map((apt) => (
                        <div key={apt.id} className={styles.historyItem}>
                          <div className={styles.historyDate}>
                            <span className={styles.historyDay}>
                              {new Date(apt.date + 'T00:00:00').getDate()}
                            </span>
                            <span className={styles.historyMonth}>
                              {new Date(apt.date + 'T00:00:00').toLocaleDateString('fr-FR', { month: 'short' })}
                            </span>
                          </div>
                          <div className={styles.historyInfo}>
                            <span className={styles.historyService}>{apt.service}</span>
                            <span className={styles.historyTime}>{apt.time}</span>
                          </div>
                          <span
                            className={`badge ${
                              apt.status === 'confirme' ? 'badge-confirmed' :
                              apt.status === 'en_attente' ? 'badge-pending' :
                              'badge-cancelled'
                            }`}
                          >
                            <span className="badge-dot" />
                            {apt.status === 'confirme' ? 'Confirmé' :
                             apt.status === 'en_attente' ? 'En attente' : 'Annulé'}
                          </span>
                        </div>
                      ))}
                  </div>
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
        <Link href="/admin/clients" className={`${styles.mobileBarLink} ${styles.mobileBarLinkActive}`}>
          <Users size={18} />
          <span>Clients</span>
        </Link>
        <Link href="/admin/settings" className={styles.mobileBarLink}>
          <Settings size={18} />
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
