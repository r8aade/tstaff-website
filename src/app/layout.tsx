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
    default: "Talnt Staffing — Hourly Staff for Print Shops & Ecommerce",
    template: "%s | Talnt Staffing"
  },
  description:
    "Customer service and back-office staff from the Philippines and India, billed hourly. No monthly fee, no long contract. Built for print shops and ecommerce sellers.",
  openGraph: {
    type: "website",
    siteName: "Talnt Staffing",
    title: "Talnt Staffing — Hourly Staff for Print Shops & Ecommerce",
    description:
      "Customer service and back-office staff, billed hourly. No monthly fee, no long contract."
  }
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "EmploymentAgency",
  name: "Talnt Staffing",
  alternateName: "TStaff",
  url: "https://talntstaffing.com",
  description:
    "Hourly virtual staffing for print shops and ecommerce businesses. Customer service and back-office support sourced from the Philippines and India.",
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
