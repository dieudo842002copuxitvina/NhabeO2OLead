import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Giá Nông Sản Hôm Nay | Agri Dashboard Nhà Bè Agri',
  description: 'Trang giá nông sản đang được cập nhật lại dữ liệu và sẽ sớm quay trở lại.',
  alternates: {
    canonical: '/gia-nong-san',
  },
};

export default function GiaNongSanPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full rounded-2xl bg-white p-8 text-center text-lg font-medium text-gray-700 shadow-sm">
          Đang cập nhật dữ liệu giá nông sản...
        </div>
      </div>
    </main>
  );
}
