import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "BarberBook — Réservation en ligne pour barbiers et salons de coiffure",
  description:
    "BarberBook est une application SaaS moderne permettant aux barbiers et salons de coiffure de gérer facilement leurs rendez-vous clients. Réservez en quelques secondes.",
  keywords: [
    "barbier",
    "coiffure",
    "réservation",
    "rendez-vous",
    "salon",
    "booking",
    "barber",
  ],
  openGraph: {
    title: "BarberBook — Réservation en ligne",
    description:
      "Gérez vos rendez-vous de coiffure et barbier en toute simplicité.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a17',
              color: '#fafaf9',
              fontSize: '0.85rem',
              fontWeight: 550,
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fafaf9',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fafaf9',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
