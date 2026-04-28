import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Search } from "lucide-react";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  category: "Kiến thức Nông nghiệp" | "Câu chuyện Thành công" | "Xu hướng Thị trường";
  date: string;
  author: string;
};

const POSTS: BlogPost[] = [
  {
    id: "b1",
    title: "Giải pháp tưới sầu riêng mùa khô: Cân bằng ẩm tầng rễ và tiết kiệm điện bơm",
    slug: "giai-phap-tuoi-sau-rieng-mua-kho",
    excerpt: "Quy trình thiết kế lưu lượng - áp lực cho vườn sầu riêng tại Tây Nguyên, tối ưu chi phí vận hành và giảm thất thoát nước.",
    coverImage: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1400&q=80",
    category: "Kiến thức Nông nghiệp",
    date: "28/04/2026",
    author: "Kỹ sư Nhà Bè Agri",
  },
  {
    id: "b2",
    title: "Từ 12ha cà phê đến hệ thống châm phân tự động: Hành trình tăng năng suất 18%",
    slug: "cau-chuyen-tuoi-cham-phan-ca-phe-12ha",
    excerpt: "Case study triển khai thực tế với chiến lược tưới và dinh dưỡng theo chu kỳ sinh trưởng của cây cà phê.",
    coverImage: "https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?auto=format&fit=crop&w=1200&q=80",
    category: "Câu chuyện Thành công",
    date: "24/04/2026",
    author: "Ban dự án O2O",
  },
  {
    id: "b3",
    title: "Giá nông sản quý II/2026: Xu hướng ảnh hưởng trực tiếp đến quyết định đầu tư hệ tưới",
    slug: "xu-huong-gia-nong-san-quy-2-2026",
    excerpt: "Phân tích ngắn gọn các biến số thị trường quan trọng và cách nông hộ ra quyết định đầu tư thiết bị thông minh.",
    coverImage: "https://images.unsplash.com/photo-1589923158776-cb4485d99fd6?auto=format&fit=crop&w=1200&q=80",
    category: "Xu hướng Thị trường",
    date: "22/04/2026",
    author: "Nhóm Market Insight",
  },
  {
    id: "b4",
    title: "Checklist 9 bước kiểm tra hệ thống trước mùa mưa để tránh tụt áp cục bộ",
    slug: "checklist-kiem-tra-he-thong-truoc-mua-mua",
    excerpt: "Hướng dẫn thực chiến cho đại lý và nông hộ trước cao điểm mùa vụ, hạn chế rủi ro hỏng vặt ngoài hiện trường.",
    coverImage: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=1200&q=80",
    category: "Kiến thức Nông nghiệp",
    date: "19/04/2026",
    author: "Kỹ thuật vận hành",
  },
  {
    id: "b5",
    title: "Mô hình cụm đại lý - kỹ thuật tại Đồng Nai giúp rút ngắn thời gian xử lý sự cố còn 4 giờ",
    slug: "mo-hinh-cum-dai-ly-dong-nai",
    excerpt: "Mô hình phối hợp giữa đội kỹ thuật hiện trường và trạm vật tư giúp tăng độ ổn định vận hành cho trang trại.",
    coverImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
    category: "Câu chuyện Thành công",
    date: "15/04/2026",
    author: "O2O Operation",
  },
];

const CATEGORY_COUNT = [
  { name: "Kiến thức Nông nghiệp", count: POSTS.filter((p) => p.category === "Kiến thức Nông nghiệp").length },
  { name: "Câu chuyện Thành công", count: POSTS.filter((p) => p.category === "Câu chuyện Thành công").length },
  { name: "Xu hướng Thị trường", count: POSTS.filter((p) => p.category === "Xu hướng Thị trường").length },
];

export default function BlogPage() {
  const featured = POSTS[0];
  const latest = POSTS.slice(1);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-8 space-y-8">
            <article className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
              <div className="relative h-[280px] sm:h-[400px] overflow-hidden rounded-2xl bg-gray-100">
                <Image src={featured.coverImage} alt={featured.title} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 66vw" />
              </div>
              <div className="mt-5">
                <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  {featured.category}
                </span>
                <h2 className="mt-3 text-2xl font-extrabold leading-tight text-gray-900 sm:text-4xl">{featured.title}</h2>
                <p className="mt-3 text-gray-600">{featured.excerpt}</p>
                <Link
                  href={`/blog/${featured.slug}`}
                  className="mt-5 inline-flex items-center rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
                >
                  Đọc tiếp
                </Link>
              </div>
            </article>

            <section>
              <h3 className="mb-4 text-xl font-bold text-gray-900">Bài viết mới nhất</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latest.map((post) => (
                  <article
                    key={post.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm border-none transition duration-200 hover:scale-[1.01] hover:shadow-md"
                  >
                    <Link href={`/blog/${post.slug}`} className="block">
                      <div className="relative h-48 overflow-hidden rounded-xl bg-gray-100 m-3 mb-0">
                        <Image src={post.coverImage} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                      </div>
                    </Link>
                    <div className="p-4">
                      <h4 className="line-clamp-2 min-h-[48px] text-lg font-bold text-gray-900">{post.title}</h4>
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.author}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </section>

          <aside className="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-5">
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-900">Tìm kiếm</h4>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm bài viết..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none ring-0 focus:border-green-700"
                />
              </div>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-900">Danh mục chủ đề</h4>
              <ul className="space-y-2">
                {CATEGORY_COUNT.map((item) => (
                  <li key={item.name} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                    <span className="text-sm text-gray-700">{item.name}</span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-600">{item.count}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
              <h4 className="text-lg font-bold text-green-900">Tải cẩm nang kỹ thuật Sầu Riêng 2026</h4>
              <p className="mt-2 text-sm text-green-800">
                Nhận ngay tài liệu vận hành tưới - châm phân theo mùa vụ, tối ưu cho Tây Nguyên và Đông Nam Bộ.
              </p>
              <a
                href="https://zalo.me/YOUR_ZALO_NUMBER"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#0068FF] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#005ce6]"
              >
                Nhận tài liệu qua Zalo
              </a>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
