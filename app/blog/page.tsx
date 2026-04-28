import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ChevronRight, Search } from "lucide-react";
import { GUIDES_DATA } from "@/data/guides";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  category: "Kien thuc Nong nghiep" | "Cau chuyen Thanh cong" | "Xu huong Thi truong";
  date: string;
  author: string;
};

const POSTS: BlogPost[] = [
  {
    id: "b1",
    title: "Giai phap tuoi sau rieng mua kho: Can bang am tang re va tiet kiem dien bom",
    slug: "giai-phap-tuoi-sau-rieng-mua-kho",
    excerpt:
      "Quy trinh thiet ke luu luong - ap luc cho vuon sau rieng tai Tay Nguyen, toi uu chi phi van hanh va giam that thoat nuoc.",
    coverImage: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1400&q=80",
    category: "Kien thuc Nong nghiep",
    date: "28/04/2026",
    author: "Ky su Nha Be Agri",
  },
  {
    id: "b2",
    title: "Tu 12ha ca phe den he thong cham phan tu dong: Hanh trinh tang nang suat 18%",
    slug: "cau-chuyen-tuoi-cham-phan-ca-phe-12ha",
    excerpt: "Case study trien khai thuc te voi chien luoc tuoi va dinh duong theo chu ky sinh truong cua cay ca phe.",
    coverImage: "https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?auto=format&fit=crop&w=1200&q=80",
    category: "Cau chuyen Thanh cong",
    date: "24/04/2026",
    author: "Ban du an O2O",
  },
  {
    id: "b3",
    title: "Gia nong san quy II/2026: Xu huong anh huong truc tiep den quyet dinh dau tu he tuoi",
    slug: "xu-huong-gia-nong-san-quy-2-2026",
    excerpt: "Phan tich ngan gon cac bien so thi truong quan trong va cach nong ho ra quyet dinh dau tu thiet bi thong minh.",
    coverImage: "https://images.unsplash.com/photo-1589923158776-cb4485d99fd6?auto=format&fit=crop&w=1200&q=80",
    category: "Xu huong Thi truong",
    date: "22/04/2026",
    author: "Nhom Market Insight",
  },
  {
    id: "b4",
    title: "Checklist 9 buoc kiem tra he thong truoc mua mua de tranh tut ap cuc bo",
    slug: "checklist-kiem-tra-he-thong-truoc-mua-mua",
    excerpt: "Huong dan thuc chien cho dai ly va nong ho truoc cao diem mua vu, han che rui ro hong vat ngoai hien truong.",
    coverImage: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=1200&q=80",
    category: "Kien thuc Nong nghiep",
    date: "19/04/2026",
    author: "Ky thuat van hanh",
  },
];

const CATEGORY_COUNT = [
  { name: "Kien thuc Nong nghiep", count: POSTS.filter((p) => p.category === "Kien thuc Nong nghiep").length },
  { name: "Cau chuyen Thanh cong", count: POSTS.filter((p) => p.category === "Cau chuyen Thanh cong").length },
  { name: "Xu huong Thi truong", count: POSTS.filter((p) => p.category === "Xu huong Thi truong").length },
];

export default function BlogPage() {
  const featured = POSTS[0];
  const latest = POSTS.slice(1);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-12">
        <section className="space-y-8 lg:col-span-8">
          <article className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
            <div className="relative h-[280px] overflow-hidden rounded-2xl bg-gray-100 sm:h-[400px]">
              <Image src={featured.coverImage} alt={featured.title} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 66vw" />
            </div>
            <div className="mt-5">
              <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">{featured.category}</span>
              <h2 className="mt-3 text-2xl font-extrabold leading-tight text-gray-900 sm:text-4xl">{featured.title}</h2>
              <p className="mt-3 text-gray-600">{featured.excerpt}</p>
              <Link href={`/blog/${featured.slug}`} className="mt-5 inline-flex items-center rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800">
                Doc tiep
              </Link>
            </div>
          </article>

          <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">So Tay Ky Thuat Theo Cay Trong</h3>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{GUIDES_DATA.length} lo trinh</span>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {GUIDES_DATA.map((guide) => (
                <article key={guide.slug} className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                  <div className="relative h-44 bg-gray-100">
                    <Image src={guide.image} alt={guide.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h4 className="line-clamp-2 text-lg font-bold text-white">{guide.title}</h4>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-sm text-gray-600">{guide.description}</p>
                    <ul className="mt-4 space-y-2">
                      {guide.chapters.map((chapter) => (
                        <li key={`${guide.slug}-${chapter.slug}`}>
                          <Link
                            href={`/blog/${guide.slug}/${chapter.slug}`}
                            className="group flex items-start justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-green-50 hover:text-green-800"
                          >
                            <span className="line-clamp-2">
                              <span className="mr-1 font-semibold text-green-700">Buoc {chapter.step}:</span>
                              {chapter.title.replace(/^Phan \d+:\s*/i, "")}
                            </span>
                            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 transition group-hover:text-green-700" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-xl font-bold text-gray-900">Bai viet moi nhat</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {latest.map((post) => (
                <article key={post.id} className="overflow-hidden rounded-2xl border-none bg-white shadow-sm transition duration-200 hover:scale-[1.01] hover:shadow-md">
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="relative m-3 mb-0 h-48 overflow-hidden rounded-xl bg-gray-100">
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

        <aside className="h-fit space-y-5 lg:sticky lg:top-24 lg:col-span-4">
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-900">Tim kiem</h4>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tim bai viet..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none ring-0 focus:border-green-700"
              />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-900">Danh muc chu de</h4>
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
            <h4 className="text-lg font-bold text-green-900">Tai cam nang ky thuat Sau Rieng 2026</h4>
            <p className="mt-2 text-sm text-green-800">
              Nhan ngay tai lieu van hanh tuoi - cham phan theo mua vu, toi uu cho Tay Nguyen va Dong Nam Bo.
            </p>
            <a
              href="https://zalo.me/YOUR_ZALO_NUMBER"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#0068FF] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#005ce6]"
            >
              Nhan tai lieu qua Zalo
            </a>
          </section>
        </aside>
      </div>
    </main>
  );
}
