import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "EmploymentAgency",
  name: "TStaff",
  alternateName: "Talnt Staffing",
  url: "https://talntstaffing.com",
  description:
    "Full-service staffing agency providing hourly back-office, administrative, marketing, sales, CRM, and technical support staff sourced from the Philippines and India.",
  areaServed: "US",
  priceRange: "$10-$15/hr",
  email: "hello@talntstaffing.com"
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={orgSchema} />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
