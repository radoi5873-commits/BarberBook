'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Appointment, AppointmentStatus } from '@/types';
import {
  Scissors,
  LayoutDashboard,
  Calendar as CalendarIcon,
  Globe,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Trash2,
  Search,
  Filter,
  Download,
  LogOut,
  Euro,
  Users,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Settings,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from './admin.module.css';

// Services mapping with prices for advanced analytics
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

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  en_attente: 'En attente',
  confirme: 'Confirmé',
  annule: 'Annulé',
};

const STATUS_BADGE_CLASS: Record<AppointmentStatus, string> = {
  en_attente: 'badge-pending',
  confirme: 'badge-confirmed',
  annule: 'badge-cancelled',
};

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tabs: 'list' (standard dashboard) | 'calendar' (visual calendar)
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');
  
  // Filtering & Search
  const [filter, setFilter] = useState<'all' | AppointmentStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Calendar Specific states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayAppointments, setSelectedDayAppointments] = useState<Appointment[]>([]);
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);

  // 1. Authenticate Guard on client mount
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
      toast.error('Erreur de chargement des rendez-vous depuis Supabase.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated, fetchAppointments]);

  // 2. Action updates
  const updateStatus = async (id: string, status: AppointmentStatus) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      if (status === 'confirme') {
        toast.success('Rendez-vous confirmé avec succès !');
      } else if (status === 'annule') {
        toast.error('Rendez-vous annulé.');
      }

      await fetchAppointments();
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Impossible de modifier le statut.');
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Rendez-vous supprimé définitivement.');
      setDeleteConfirm(null);
      await fetchAppointments();
    } catch (err) {
      console.error('Error deleting appointment:', err);
      toast.error('Erreur lors de la suppression.');
    }
  };

  // 3. Analytics Computations
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const totalCount = appointments.length;
    const confirmedCount = appointments.filter(a => a.status === 'confirme').length;
    const pendingCount = appointments.filter(a => a.status === 'en_attente').length;
    const todayCount = appointments.filter(a => a.date === todayStr).length;

    // Estimate revenue based on confirmed appointments
    const estimatedRevenue = appointments
      .filter(a => a.status === 'confirme')
      .reduce((sum, a) => sum + (SERVICE_PRICES[a.service] || 20), 0);

    // Compute popular services ranking
    const serviceDistribution: Record<string, number> = {};
    appointments.forEach((a) => {
      serviceDistribution[a.service] = (serviceDistribution[a.service] || 0) + 1;
    });

    const popularServices = Object.entries(serviceDistribution)
      .map(([name, count]) => ({
        name,
        count,
        percent: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    return {
      total: totalCount,
      today: todayCount,
      confirmed: confirmedCount,
      pending: pendingCount,
      revenue: estimatedRevenue,
      popularServices,
    };
  }, [appointments]);

  // 4. Filtering list
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const matchesFilter = filter === 'all' || a.status === filter;
      const matchesSearch =
        a.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.phone.includes(searchQuery) ||
        a.service.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = !dateFilter || a.date === dateFilter;
      return matchesFilter && matchesSearch && matchesDate;
    });
  }, [appointments, filter, searchQuery, dateFilter]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // 5. CSV Export Engine
  const exportToCSV = () => {
    if (filteredAppointments.length === 0) {
      toast.error('Aucun résultat à exporter.');
      return;
    }

    const headers = ['ID', 'Client', 'Telephone', 'Email', 'Service', 'Date', 'Heure', 'Statut', 'Date de creation'];
    const rows = filteredAppointments.map((a) => [
      a.id,
      `"${a.full_name.replace(/"/g, '""')}"`,
      a.phone,
      a.email,
      `"${a.service}"`,
      a.date,
      a.time,
      a.status,
      a.created_at,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `barberbook_appointments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Fichier CSV exporté avec succès.');
  };

  // 6. Visual Calendar grid math
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of current month
    const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday=0, Monday=1
    // Ajust index to make Monday = 0
    const adjustedFirstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Prev Month padding days
    for (let i = adjustedFirstDayIndex; i > 0; i--) {
      const dayNum = totalDaysInPrevMonth - i + 1;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({ dayNum, isCurrentMonth: false, dateStr });
    }

    // Current Month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dayNum: i, isCurrentMonth: true, dateStr });
    }

    // Next Month padding days
    const totalCells = 42; // standard 6 rows grid
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dayNum: i, isCurrentMonth: false, dateStr });
    }

    return days;
  }, [currentDate]);

  // Appointments grouped by date for fast calendar queries
  const calendarEventsMap = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    appointments.forEach((a) => {
      map[a.date] = map[a.date] || [];
      map[a.date].push(a);
    });
    return map;
  }, [appointments]);

  const handleDayClick = (dateStr: string) => {
    setSelectedDayStr(dateStr);
    setSelectedDayAppointments(calendarEventsMap[dateStr] || []);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const currentMonthLabel = currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

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
      {/* Sidebar Panel */}
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
            <span className={styles.sidebarSectionTitle}>Vues dashboard</span>
            <button
              onClick={() => setActiveTab('list')}
              className={`${styles.sidebarLink} ${activeTab === 'list' ? styles.sidebarLinkActive : ''}`}
            >
              <LayoutDashboard size={16} />
              <span>Tableau de bord</span>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`${styles.sidebarLink} ${activeTab === 'calendar' ? styles.sidebarLinkActive : ''}`}
            >
              <CalendarIcon size={16} />
              <span>Calendrier visuel</span>
            </button>
            <Link href="/admin/clients" className={styles.sidebarLink}>
              <Users size={16} />
              <span>Clients</span>
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

          {activeTab === 'list' && (
            <div className={styles.sidebarSection}>
              <span className={styles.sidebarSectionTitle}>Statuts</span>
              <button
                onClick={() => setFilter('all')}
                className={`${styles.sidebarLink} ${filter === 'all' ? styles.sidebarLinkSelected : ''}`}
              >
                <Filter size={14} />
                <span>Tous</span>
                <span className={styles.sidebarBadge}>{stats.total}</span>
              </button>
              <button
                onClick={() => setFilter('en_attente')}
                className={`${styles.sidebarLink} ${filter === 'en_attente' ? styles.sidebarLinkSelected : ''}`}
              >
                <Clock size={14} />
                <span>En attente</span>
                <span className={`${styles.sidebarBadge} ${styles.sidebarBadgePending}`}>
                  {stats.pending}
                </span>
              </button>
              <button
                onClick={() => setFilter('confirme')}
                className={`${styles.sidebarLink} ${filter === 'confirme' ? styles.sidebarLinkSelected : ''}`}
              >
                <CheckCircle2 size={14} />
                <span>Confirmés</span>
                <span className={`${styles.sidebarBadge} ${styles.sidebarBadgeConfirmed}`}>
                  {stats.confirmed}
                </span>
              </button>
              <button
                onClick={() => setFilter('annule')}
                className={`${styles.sidebarLink} ${filter === 'annule' ? styles.sidebarLinkSelected : ''}`}
              >
                <XCircle size={14} />
                <span>Annulés</span>
                <span className={`${styles.sidebarBadge} ${styles.sidebarBadgeCancelled}`}>
                  {stats.total - stats.confirmed - stats.pending}
                </span>
              </button>
            </div>
          )}

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
        {/* Header toolbar */}
        <header className={styles.topbar}>
          <div>
            <span className={styles.premiumTag}>Premium Pro SaaS</span>
            <h1 className={styles.pageTitle}>
              {activeTab === 'list' ? 'Tableau de bord de gestion' : 'Calendrier des rendez-vous'}
            </h1>
            <p className={styles.pageSubtitle}>
              Accédez aux données de votre salon en temps réel et pilotez votre activité.
            </p>
          </div>
          <div className={styles.topActions}>
            {activeTab === 'list' && (
              <button onClick={exportToCSV} className="btn btn-secondary btn-sm">
                <Download size={15} />
                Exporter CSV
              </button>
            )}
            <Link href="/" className="btn btn-ghost btn-sm">
              <Globe size={15} />
              Voir le site
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} anim-fade-up anim-d1`}>
            <div className={styles.statIcon} style={{ background: 'rgba(243, 115, 24, 0.08)', color: 'var(--brand-500)' }}>
              <Scissors size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.total}</span>
              <span className={styles.statLabel}>Total RDV</span>
            </div>
          </div>

          <div className={`${styles.statCard} anim-fade-up anim-d2`}>
            <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.08)', color: '#3b82f6' }}>
              <Euro size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.revenue} €</span>
              <span className={styles.statLabel}>Chiffre d&apos;Affaires estimé</span>
            </div>
          </div>

          <div className={`${styles.statCard} anim-fade-up anim-d3`}>
            <div className={styles.statIcon} style={{ background: 'var(--success-50)', color: 'var(--success-600)' }}>
              <CheckCircle2 size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.confirmed}</span>
              <span className={styles.statLabel}>RDV Confirmés</span>
            </div>
          </div>

          <div className={`${styles.statCard} anim-fade-up anim-d4`}>
            <div className={styles.statIcon} style={{ background: 'var(--warning-50)', color: 'var(--warning-600)' }}>
              <Clock size={20} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.pending}</span>
              <span className={styles.statLabel}>RDV En attente</span>
            </div>
          </div>
        </div>

        {activeTab === 'list' ? (
          /* ========================================================
             TAB 1: DATA LIST & DETAILS VIEW
             ======================================================== */
          <div className={styles.dashboardSplit}>
            <div className={`${styles.tableContainer} ${styles.flexTable}`}>
              {/* Toolbar */}
              <div className={styles.tableToolbar}>
                <div className={styles.filterControls}>
                  <div className={styles.searchWrapper}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                      type="text"
                      placeholder="Nom, téléphone, service..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={styles.searchInput}
                    />
                  </div>
                  <div className={styles.dateFilterWrapper}>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className={styles.dateInput}
                      title="Filtrer par date"
                    />
                    {dateFilter && (
                      <button
                        onClick={() => setDateFilter('')}
                        className={styles.clearDateBtn}
                        title="Effacer le filtre par date"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
                <div className={styles.filterSummary}>
                  <span className={styles.resultCount}>
                    {filteredAppointments.length} résultat{filteredAppointments.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {loading ? (
                <div className={styles.loadingState}>
                  <span className={styles.spinner} />
                  <p>Chargement des réservations depuis Supabase...</p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIconWrapper}>
                    <AlertCircle size={32} />
                  </div>
                  <p className={styles.emptyTitle}>Aucun rendez-vous trouvé</p>
                  <p className={styles.emptyText}>
                    Modifiez vos critères de filtrage ou de recherche.
                  </p>
                </div>
              ) : (
                <div className={styles.tableScroll}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Téléphone</th>
                        <th>Service demandé</th>
                        <th>Date & Heure</th>
                        <th>Prix</th>
                        <th>Statut</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((apt) => (
                        <tr key={apt.id} className={styles.tableRow}>
                          <td>
                            <div className={styles.clientCell}>
                              <div className={styles.clientInitial}>
                                {apt.full_name ? apt.full_name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <div className={styles.clientName}>{apt.full_name}</div>
                                <div className={styles.clientEmail}>{apt.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className={styles.phoneCell}>{apt.phone}</td>
                          <td>
                            <span className={styles.serviceTag}>{apt.service}</span>
                          </td>
                          <td>
                            <div className={styles.dateTimeCell}>
                              <span className={styles.dateLabel}>{formatDate(apt.date)}</span>
                              <span className={styles.timeLabel}>{apt.time}</span>
                            </div>
                          </td>
                          <td>
                            <span className={styles.priceLabel}>
                              {SERVICE_PRICES[apt.service] || 20} €
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${STATUS_BADGE_CLASS[apt.status]}`}>
                              <span className="badge-dot" />
                              {STATUS_LABELS[apt.status]}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actionCell}>
                              {apt.status !== 'confirme' && (
                                <button
                                  onClick={() => updateStatus(apt.id, 'confirme')}
                                  className={`${styles.actionButton} ${styles.actionBtnConfirm}`}
                                  title="Valider la réservation"
                                >
                                  <CheckCircle2 size={14} />
                                </button>
                              )}
                              {apt.status !== 'annule' && (
                                <button
                                  onClick={() => updateStatus(apt.id, 'annule')}
                                  className={`${styles.actionButton} ${styles.actionBtnCancel}`}
                                  title="Annuler"
                                >
                                  <XCircle size={14} />
                                </button>
                              )}
                              {deleteConfirm === apt.id ? (
                                <div className={styles.confirmBox}>
                                  <button
                                    onClick={() => deleteAppointment(apt.id)}
                                    className={styles.confirmYes}
                                  >
                                    Supprimer
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className={styles.confirmNo}
                                  >
                                    Non
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirm(apt.id)}
                                  className={`${styles.actionButton} ${styles.actionBtnDelete}`}
                                  title="Supprimer"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Sidebar analytics panel */}
            <div className={styles.sideAnalyticsPanel}>
              <h3 className={styles.sidePanelTitle}>
                <TrendingUp size={16} />
                Services Populaires
              </h3>
              <p className={styles.sidePanelSubtitle}>
                Répartition des prestations réalisées et prévues dans le salon.
              </p>

              <div className={styles.distributionList}>
                {stats.popularServices.length === 0 ? (
                  <p className={styles.noDataNote}>Données insuffisantes pour établir des statistiques.</p>
                ) : (
                  stats.popularServices.map((s, idx) => (
                    <div key={idx} className={styles.distributionItem}>
                      <div className={styles.distributionHead}>
                        <span className={styles.distServiceName}>{s.name}</span>
                        <span className={styles.distCountLabel}>
                          {s.count} RDV ({s.percent}%)
                        </span>
                      </div>
                      <div className={styles.progressBarWrapper}>
                        <div
                          className={styles.progressBar}
                          style={{
                            width: `${s.percent}%`,
                            background: idx === 0 ? 'var(--brand-500)' : idx === 1 ? '#3b82f6' : idx === 2 ? '#10b981' : '#8b5cf6',
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Price list reference */}
              <div className={styles.priceListRef}>
                <h4 className={styles.priceRefTitle}>Tarifs de référence</h4>
                <div className={styles.priceGrid}>
                  {Object.entries(SERVICE_PRICES).map(([name, price]) => (
                    <div key={name} className={styles.priceGridRow}>
                      <span>{name}</span>
                      <strong>{price} €</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
             TAB 2: INTERACTIVE VISUAL CALENDAR
             ======================================================== */
          <div className={styles.calendarContainer}>
            <div className={styles.calendarCard}>
              <div className={styles.calendarHeader}>
                <h2 className={styles.calendarMonthLabel}>{currentMonthLabel}</h2>
                <div className={styles.calendarNavButtons}>
                  <button onClick={handlePrevMonth} className={styles.calNavBtn}>
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={handleNextMonth} className={styles.calNavBtn}>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Days header */}
              <div className={styles.calendarWeekdays}>
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((w) => (
                  <span key={w} className={styles.weekdayCell}>{w}</span>
                ))}
              </div>

              {/* Days Grid */}
              <div className={styles.calendarGrid}>
                {calendarDays.map((c, index) => {
                  const events = calendarEventsMap[c.dateStr] || [];
                  const confirmedEvents = events.filter(e => e.status === 'confirme');
                  const pendingEvents = events.filter(e => e.status === 'en_attente');
                  
                  const isSelected = selectedDayStr === c.dateStr;

                  return (
                    <div
                      key={index}
                      onClick={() => handleDayClick(c.dateStr)}
                      className={`${styles.calendarDayCell} ${c.isCurrentMonth ? '' : styles.otherMonthDay} ${isSelected ? styles.selectedDayCell : ''}`}
                    >
                      <span className={styles.dayNumber}>{c.dayNum}</span>
                      
                      {events.length > 0 && (
                        <div className={styles.eventsIndicator}>
                          {confirmedEvents.length > 0 && (
                            <span className={`${styles.dotDot} ${styles.dotGreen}`} title={`${confirmedEvents.length} confirmés`} />
                          )}
                          {pendingEvents.length > 0 && (
                            <span className={`${styles.dotDot} ${styles.dotOrange}`} title={`${pendingEvents.length} en attente`} />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calendar details sidebar drawer */}
            <div className={styles.calendarDetailsDrawer}>
              <h3 className={styles.drawerTitle}>
                <CalendarIcon size={16} />
                RDV du {selectedDayStr ? new Date(selectedDayStr + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Sélectionnez un jour'}
              </h3>

              <div className={styles.drawerList}>
                {!selectedDayStr ? (
                  <p className={styles.drawerInfoNote}>Cliquez sur un jour du calendrier pour afficher les détails des réservations.</p>
                ) : selectedDayAppointments.length === 0 ? (
                  <p className={styles.drawerInfoNote}>Aucun rendez-vous de planifié pour cette date.</p>
                ) : (
                  selectedDayAppointments.map((apt) => (
                    <div key={apt.id} className={styles.drawerEventItem}>
                      <div className={styles.drawerEventTop}>
                        <strong className={styles.drawerEventTime}>{apt.time}</strong>
                        <span className={`badge ${STATUS_BADGE_CLASS[apt.status]}`}>
                          {STATUS_LABELS[apt.status]}
                        </span>
                      </div>
                      <div className={styles.drawerEventBody}>
                        <div className={styles.drawerClientName}>{apt.full_name}</div>
                        <div className={styles.drawerClientService}>{apt.service}</div>
                        <div className={styles.drawerClientContact}>
                          <span>{apt.phone}</span>
                        </div>
                      </div>
                      {apt.status === 'en_attente' && (
                        <div className={styles.drawerEventActions}>
                          <button
                            onClick={() => updateStatus(apt.id, 'confirme')}
                            className={styles.drawerQuickConfirm}
                          >
                            Valider
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile nav indicator bar */}
      <nav className={styles.mobileBar}>
        <button
          onClick={() => { setActiveTab('list'); setFilter('all'); }}
          className={`${styles.mobileBarLink} ${activeTab === 'list' ? styles.mobileBarLinkActive : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>
        <Link href="/admin/clients" className={styles.mobileBarLink}>
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
