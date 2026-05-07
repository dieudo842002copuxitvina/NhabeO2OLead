import SiteFooter from "@/components/SiteFooter";

export default function DaiLySlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {children}
      <div className="flex-shrink-0 mt-auto">
        <SiteFooter />
      </div>
    </div>
  );
}
