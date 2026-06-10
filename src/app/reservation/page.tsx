'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { AppointmentFormData } from '@/types';
import {
  Scissors,
  ArrowLeft,
  ArrowRight,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Euro,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from './reservation.module.css';

const SERVICES = [
  { name: 'Coupe homme', price: 25, duration: '30 min', icon: '✂️' },
  { name: 'Coupe + Barbe', price: 40, duration: '45 min', icon: '💈' },
  { name: 'Taille de barbe', price: 18, duration: '20 min', icon: '🧔' },
  { name: 'Coloration', price: 55, duration: '60 min', icon: '🎨' },
  { name: 'Coupe enfant', price: 15, duration: '25 min', icon: '👦' },
  { name: 'Soin capillaire', price: 30, duration: '35 min', icon: '✨' },
  { name: 'Coupe dégradé', price: 28, duration: '35 min', icon: '📐' },
  { name: 'Rasage classique', price: 22, duration: '25 min', icon: '🪒' },
];

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '14:00',
  '14:30', '15:00', '15:30', '16:00',
  '16:30', '17:00', '17:30', '18:00',
];

const STEPS = [
  { label: 'Service', icon: Scissors },
  { label: 'Date & Heure', icon: Calendar },
  { label: 'Vos infos', icon: User },
  { label: 'Confirmation', icon: CheckCircle2 },
];

export default function ReservationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<AppointmentFormData>({
    full_name: '',
    phone: '',
    email: '',
    service: '',
    date: '',
    time: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Real-time availability: booked slots for selected date
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const selectedService = useMemo(
    () => SERVICES.find((s) => s.name === formData.service),
    [formData.service]
  );

  // Fetch booked slots when date changes
  useEffect(() => {
    if (!formData.date) return;

    const fetchBookedSlots = async () => {
      setLoadingSlots(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('appointments')
          .select('time')
          .eq('date', formData.date)
          .neq('status', 'annule');

        if (fetchError) throw fetchError;
        setBookedSlots((data || []).map((d) => d.time));
      } catch {
        console.error('Error fetching slots');
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchBookedSlots();
  }, [formData.date]);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    if (!formData.full_name || !formData.phone || !formData.email || !formData.service || !formData.date || !formData.time) {
      setError('Veuillez remplir tous les champs.');
      setLoading(false);
      return;
    }

    try {
      const { error: supabaseError } = await supabase
        .from('appointments')
        .insert([
          {
            full_name: formData.full_name,
            phone: formData.phone,
            email: formData.email,
            service: formData.service,
            date: formData.date,
            time: formData.time,
            status: 'en_attente',
          },
        ]);

      if (supabaseError) throw supabaseError;
      toast.success('Rendez-vous créé avec succès !');
      setSuccess(true);
    } catch (err) {
      console.error('Booking error:', err);
      toast.error('Erreur lors de la création de la réservation.');
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const canNext = (() => {
    if (currentStep === 0) return !!formData.service;
    if (currentStep === 1) return !!formData.date && !!formData.time;
    if (currentStep === 2) return !!formData.full_name && !!formData.phone && !!formData.email;
    return true;
  })();

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const resetForm = () => {
    setFormData({ full_name: '', phone: '', email: '', service: '', date: '', time: '' });
    setCurrentStep(0);
    setSuccess(false);
    setError('');
  };

  // Generate next 14 days for date picker
  const nextDays = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      // Skip sundays (0 = sunday)
      if (d.getDay() === 0) continue;
      days.push({
        dateStr: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString('fr-FR', { month: 'short' }),
        isToday: i === 0,
      });
    }
    return days;
  }, []);

  return (
    <div className={styles.page}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={`container ${styles.navInner}`}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoMark}>
              <Scissors size={18} strokeWidth={2.5} />
            </div>
            <span className={styles.logoLabel}>
              Barber<span className={styles.logoAccent}>Book</span>
            </span>
          </Link>
          <Link href="/" className="btn btn-ghost btn-sm">
            <ArrowLeft size={16} />
            Retour
          </Link>
        </div>
      </nav>

      <main className={styles.main}>
        <div className="container">
          {!success ? (
            <div className={`${styles.wizardWrapper} anim-scale-in`}>
              {/* Step Progress Bar */}
              <div className={styles.stepProgress}>
                {STEPS.map((step, i) => (
                  <div
                    key={i}
                    className={`${styles.stepItem} ${i <= currentStep ? styles.stepActive : ''} ${i < currentStep ? styles.stepDone : ''}`}
                  >
                    <div className={styles.stepCircle}>
                      {i < currentStep ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <step.icon size={16} />
                      )}
                    </div>
                    <span className={styles.stepLabel}>{step.label}</span>
                    {i < STEPS.length - 1 && <div className={styles.stepConnector} />}
                  </div>
                ))}
              </div>

              {/* Step Content */}
              <div className={styles.stepContent}>
                {/* ====== STEP 1: Service Selection ====== */}
                {currentStep === 0 && (
                  <div className={`${styles.stepPanel} anim-fade-up`}>
                    <div className={styles.stepHeader}>
                      <span className={styles.stepTag}>Étape 1</span>
                      <h2 className={styles.stepTitle}>
                        Choisissez votre <span className={styles.accent}>prestation</span>
                      </h2>
                      <p className={styles.stepDesc}>
                        Sélectionnez le service qui correspond à vos besoins.
                      </p>
                    </div>

                    <div className={styles.serviceGrid}>
                      {SERVICES.map((srv) => (
                        <button
                          key={srv.name}
                          onClick={() => setFormData((p) => ({ ...p, service: srv.name }))}
                          className={`${styles.serviceCard} ${formData.service === srv.name ? styles.serviceSelected : ''}`}
                        >
                          <span className={styles.serviceEmoji}>{srv.icon}</span>
                          <span className={styles.serviceName}>{srv.name}</span>
                          <div className={styles.serviceMeta}>
                            <span className={styles.servicePrice}>{srv.price} €</span>
                            <span className={styles.serviceDuration}>{srv.duration}</span>
                          </div>
                          {formData.service === srv.name && (
                            <div className={styles.serviceCheck}>
                              <CheckCircle2 size={16} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ====== STEP 2: Date & Time ====== */}
                {currentStep === 1 && (
                  <div className={`${styles.stepPanel} anim-fade-up`}>
                    <div className={styles.stepHeader}>
                      <span className={styles.stepTag}>Étape 2</span>
                      <h2 className={styles.stepTitle}>
                        Choisissez votre <span className={styles.accent}>créneau</span>
                      </h2>
                      <p className={styles.stepDesc}>
                        Sélectionnez la date et l&apos;heure de votre rendez-vous.
                      </p>
                    </div>

                    {/* Date Picker Horizontal Scroll */}
                    <div className={styles.dateSection}>
                      <h3 className={styles.subSectionTitle}>
                        <Calendar size={16} /> Date
                      </h3>
                      <div className={styles.dateScroller}>
                        {nextDays.map((day) => (
                          <button
                            key={day.dateStr}
                            onClick={() => setFormData((p) => ({ ...p, date: day.dateStr, time: '' }))}
                            className={`${styles.dateChip} ${formData.date === day.dateStr ? styles.dateChipSelected : ''}`}
                          >
                            <span className={styles.dateChipDay}>{day.dayName}</span>
                            <span className={styles.dateChipNum}>{day.dayNum}</span>
                            <span className={styles.dateChipMonth}>{day.monthName}</span>
                            {day.isToday && <span className={styles.todayBadge}>Auj.</span>}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time Slots Grid */}
                    {formData.date && (
                      <div className={styles.timeSection}>
                        <h3 className={styles.subSectionTitle}>
                          <Clock size={16} /> Créneau horaire
                          {loadingSlots && <span className={styles.slotSpinner} />}
                        </h3>
                        <div className={styles.timeGrid}>
                          {TIME_SLOTS.map((slot) => {
                            const isBooked = bookedSlots.includes(slot);
                            return (
                              <button
                                key={slot}
                                onClick={() => !isBooked && setFormData((p) => ({ ...p, time: slot }))}
                                disabled={isBooked}
                                className={`${styles.timeChip} ${formData.time === slot ? styles.timeChipSelected : ''} ${isBooked ? styles.timeChipBooked : ''}`}
                              >
                                {slot}
                                {isBooked && <span className={styles.bookedLabel}>Pris</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ====== STEP 3: Personal Info ====== */}
                {currentStep === 2 && (
                  <div className={`${styles.stepPanel} anim-fade-up`}>
                    <div className={styles.stepHeader}>
                      <span className={styles.stepTag}>Étape 3</span>
                      <h2 className={styles.stepTitle}>
                        Vos <span className={styles.accent}>coordonnées</span>
                      </h2>
                      <p className={styles.stepDesc}>
                        Renseignez vos informations pour finaliser la réservation.
                      </p>
                    </div>

                    <div className={styles.infoForm}>
                      <div className="form-group">
                        <label htmlFor="full_name" className="form-label">
                          Nom complet
                        </label>
                        <div className={styles.inputWrapper}>
                          <User size={16} className={styles.inputIcon} />
                          <input
                            id="full_name"
                            name="full_name"
                            type="text"
                            className={`${styles.formInputWithIcon} form-input`}
                            placeholder="ex: Jean Dupont"
                            value={formData.full_name}
                            onChange={(e) => setFormData((p) => ({ ...p, full_name: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className={styles.infoGrid}>
                        <div className="form-group">
                          <label htmlFor="phone" className="form-label">
                            Téléphone
                          </label>
                          <div className={styles.inputWrapper}>
                            <Phone size={16} className={styles.inputIcon} />
                            <input
                              id="phone"
                              name="phone"
                              type="tel"
                              className={`${styles.formInputWithIcon} form-input`}
                              placeholder="ex: 06 12 34 56 78"
                              value={formData.phone}
                              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                              required
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="email" className="form-label">
                            Email
                          </label>
                          <div className={styles.inputWrapper}>
                            <Mail size={16} className={styles.inputIcon} />
                            <input
                              id="email"
                              name="email"
                              type="email"
                              className={`${styles.formInputWithIcon} form-input`}
                              placeholder="ex: jean@email.com"
                              value={formData.email}
                              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ====== STEP 4: Recap & Confirm ====== */}
                {currentStep === 3 && (
                  <div className={`${styles.stepPanel} anim-fade-up`}>
                    <div className={styles.stepHeader}>
                      <span className={styles.stepTag}>
                        <Sparkles size={13} /> Récapitulatif
                      </span>
                      <h2 className={styles.stepTitle}>
                        Vérifiez votre <span className={styles.accent}>réservation</span>
                      </h2>
                      <p className={styles.stepDesc}>
                        Vérifiez les détails avant de confirmer votre rendez-vous.
                      </p>
                    </div>

                    {error && (
                      <div className={styles.errorBanner}>
                        <AlertTriangle size={18} />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className={styles.recapCard}>
                      <div className={styles.recapRow}>
                        <Scissors size={16} className={styles.recapIcon} />
                        <div className={styles.recapInfo}>
                          <span className={styles.recapLabel}>Service</span>
                          <span className={styles.recapValue}>{formData.service}</span>
                        </div>
                        {selectedService && (
                          <span className={styles.recapPrice}>{selectedService.price} €</span>
                        )}
                      </div>

                      <div className={styles.recapDivider} />

                      <div className={styles.recapRow}>
                        <Calendar size={16} className={styles.recapIcon} />
                        <div className={styles.recapInfo}>
                          <span className={styles.recapLabel}>Date</span>
                          <span className={styles.recapValue}>
                            {new Date(formData.date + 'T00:00:00').toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className={styles.recapDivider} />

                      <div className={styles.recapRow}>
                        <Clock size={16} className={styles.recapIcon} />
                        <div className={styles.recapInfo}>
                          <span className={styles.recapLabel}>Heure</span>
                          <span className={styles.recapValue}>{formData.time}</span>
                        </div>
                        {selectedService && (
                          <span className={styles.recapDuration}>{selectedService.duration}</span>
                        )}
                      </div>

                      <div className={styles.recapDivider} />

                      <div className={styles.recapRow}>
                        <User size={16} className={styles.recapIcon} />
                        <div className={styles.recapInfo}>
                          <span className={styles.recapLabel}>Client</span>
                          <span className={styles.recapValue}>{formData.full_name}</span>
                          <span className={styles.recapSub}>{formData.email} · {formData.phone}</span>
                        </div>
                      </div>

                      <div className={styles.recapTotal}>
                        <Euro size={18} />
                        <span>Total à régler sur place</span>
                        <strong>{selectedService?.price || 0} €</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className={styles.wizardFooter}>
                {currentStep > 0 && (
                  <button onClick={handleBack} className="btn btn-secondary">
                    <ArrowLeft size={16} />
                    Retour
                  </button>
                )}
                <div className={styles.wizardFooterRight}>
                  {selectedService && currentStep < 3 && (
                    <div className={styles.pricePreview}>
                      <span>{selectedService.name}</span>
                      <strong>{selectedService.price} €</strong>
                    </div>
                  )}
                  <button
                    onClick={handleNext}
                    className={`btn btn-primary ${currentStep === 3 ? 'btn-lg' : ''}`}
                    disabled={!canNext || loading}
                  >
                    {loading ? (
                      <>
                        <span className={styles.spinner} />
                        Réservation en cours...
                      </>
                    ) : currentStep === 3 ? (
                      <>
                        Confirmer la réservation
                        <CheckCircle2 size={16} />
                      </>
                    ) : (
                      <>
                        Continuer
                        <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`${styles.successWrapper} anim-scale-in`}>
              <div className={styles.successIconWrapper}>
                <CheckCircle2 className={styles.successIcon} size={48} />
              </div>
              <h2 className={styles.successTitle}>Rendez-vous enregistré !</h2>
              <p className={styles.successText}>
                Votre réservation est enregistrée. Nous l&apos;avons reçue et elle est en cours de
                validation. Vous recevrez les détails de confirmation à l&apos;adresse mail indiquée.
              </p>

              {selectedService && (
                <div className={styles.successRecap}>
                  <div className={styles.successRecapItem}>
                    <Scissors size={14} />
                    <span>{formData.service}</span>
                  </div>
                  <div className={styles.successRecapItem}>
                    <Calendar size={14} />
                    <span>
                      {new Date(formData.date + 'T00:00:00').toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </span>
                  </div>
                  <div className={styles.successRecapItem}>
                    <Clock size={14} />
                    <span>{formData.time}</span>
                  </div>
                  <div className={styles.successRecapItem}>
                    <Euro size={14} />
                    <span>{selectedService.price} €</span>
                  </div>
                </div>
              )}

              <div className={styles.successActions}>
                <button onClick={resetForm} className="btn btn-primary">
                  Faire une autre réservation
                </button>
                <Link href="/" className="btn btn-secondary">
                  Retour à l&apos;accueil
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
