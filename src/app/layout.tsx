import type { Metadata } from "next";
import { Archivo_Black, Inter } from "next/font/google";
import Providers from "@/components/Providers";
import JsonLd from "@/components/JsonLd";
import "./globals.css";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display"
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://talntstaffing.com"),
  title: {
    default: "Talnt Staffing — Full-Service Hourly Staffing for Every Industry",
    template: "%s | Talnt Staffing"
  },
  description:
    "Back-office, admin, marketing, and technical support staff from the Philippines and India, billed hourly. No monthly fee, no long contract. Full-service across every industry.",
  openGraph: {
    type: "website",
    siteName: "Talnt Staffing",
    title: "Talnt Staffing — Full-Service Hourly Staffing for Every Industry",
    description:
      "Back-office, admin, marketing, and technical support staff, billed hourly. No monthly fee, no long contract."
  }
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "EmploymentAgency",
  name: "Talnt Staffing",
  alternateName: "TStaff",
  url: "https://talntstaffing.com",
  description:
    "Full-service hourly staffing agency — back-office, administrative, marketing/sales/CRM, and technical support staff sourced from the Philippines and India, serving businesses across every industry.",
  areaServed: "US",
  priceRange: "$10-$15/hr",
  email: "hello@talntstaffing.com"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${inter.variable}`}>
      <body>
        <JsonLd data={orgSchema} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
