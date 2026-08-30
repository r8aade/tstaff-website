import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://talntstaffing.com"),
  title: {
    default: "TStaff | Full-Service Staffing for Growing Businesses",
    template: "%s | TStaff"
  },
  description:
    "TStaff provides trained, affordable staff for back-office, admin, marketing, sales, CRM, and technical support — sourced from the Philippines and India, billed hourly at $10-15/hr with no monthly fee.",
  openGraph: {
    type: "website",
    siteName: "TStaff",
    title: "TStaff | Full-Service Staffing for Growing Businesses",
    description:
      "Trained, affordable staff for back-office, admin, marketing, sales, CRM, and technical support — hourly, no monthly fee."
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
