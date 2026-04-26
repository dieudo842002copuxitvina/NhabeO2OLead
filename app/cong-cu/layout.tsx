import Link from "next/link";

export default function CongCuLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-4 overflow-x-auto text-sm">
            <Link href="/cong-cu" className="font-semibold text-[#2F8E36]">
              Hub Công cụ
            </Link>
            <Link href="/cong-cu/thuy-luc" className="text-gray-600 hover:text-gray-900">
              Máy tính Thủy lực
            </Link>
            <Link href="/cong-cu/bac-si-ai" className="text-gray-600 hover:text-gray-900">
              Bác sĩ Nông y AI
            </Link>
            <Link href="/cong-cu/cham-phan" className="text-gray-600 hover:text-gray-900">
              Châm phân
            </Link>
            <Link href="/cong-cu/dien-nuoc" className="text-gray-600 hover:text-gray-900">
              Điện nước
            </Link>
          </nav>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
