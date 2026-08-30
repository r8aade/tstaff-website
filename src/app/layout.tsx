import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "TStaff | Full-Service Staffing for Growing Businesses",
  description:
    "TStaff provides trained, affordable staff for back-office, admin, marketing, sales, CRM, and technical support — sourced from the Philippines and India, billed hourly with no monthly fee."
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
