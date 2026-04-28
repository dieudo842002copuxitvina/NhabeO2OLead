import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, PackageSearch } from "lucide-react";
import { PRODUCTS_DATA } from "@/data/products";
import ProductCard from "../../store/ProductCard";

type CategoryPageProps = {
  params: {
    slug: string;
  };
};

const CATEGORY_META: Record<string, any> = {
  // ================= 1. PHÂN BÓN & DINH DƯỠNG =================
  "phan-bon-la": {
    title: "Phân Bón Lá Nhập Khẩu Cao Cấp",
    description:
      "Giải pháp cung cấp dinh dưỡng vi lượng và đa lượng trực tiếp qua lá. Giúp cây hấp thụ tức thì, bung đọt đồng loạt và chống rụng trái non.",
    techTip:
      "💡 Kỹ thuật: Phun vào sáng sớm hoặc chiều mát. Kết hợp béc tưới phun sương để tăng độ bám dính.",
    coverBg: "bg-green-800",
  },
  "phan-huu-co-vi-sinh": {
    title: "Phân Hữu Cơ Vi Sinh Cải Tạo Đất",
    description:
      "Nền tảng cho nông nghiệp bền vững. Bổ sung tập đoàn vi sinh vật có lợi, giải độc phèn, làm tơi xốp đất và bảo vệ bộ rễ khỏi nấm bệnh.",
    techTip:
      "💡 Ứng dụng: Rất quan trọng trong giai đoạn phục hồi cây sau thu hoạch hoặc xử lý đất trước khi xuống giống.",
    coverBg: "bg-emerald-700",
  },
  "dinh-duong-cay-an-trai": {
    title: "Dinh Dưỡng Chuyên Dùng Cây Ăn Trái",
    description:
      "Công thức NPK và Vi lượng được tinh chỉnh riêng cho Sầu riêng, Bưởi, Cam, Xoài... Tối ưu hóa từng giai đoạn: Kéo đọt, ra hoa, nuôi trái.",
    techTip:
      "💡 Khuyến nghị: Nên kết hợp với hệ thống châm phân tự động (Fertigation) để tiết kiệm 40% lượng phân bón.",
    coverBg: "bg-amber-600",
  },

  // ================= 2. MÁY NÔNG NGHIỆP =================
  "may-bay-nong-nghiep": {
    title: "Drone Nông Nghiệp Xịt Thuốc & Rải Phân",
    description:
      "Hệ sinh thái máy bay DJI thế hệ mới. Tự động hóa 100% quy trình bảo vệ thực vật, hiệu suất làm việc tương đương 30 nhân công.",
    techTip:
      "💡 Dịch vụ: Nhà Bè Agri hỗ trợ chuyển giao công nghệ bay trực tiếp tại rẫy, lập bản đồ 3D cho địa hình đồi dốc.",
    coverBg: "bg-slate-800",
  },
  "dien-mat-troi": {
    title: "Hệ Thống Bơm Điện Mặt Trời (Solar Pump)",
    description:
      "Giải pháp tưới tiêu độc lập, không phụ thuộc lưới điện quốc gia. Đầu tư một lần - Tưới miễn phí hàng chục năm.",
    techTip:
      "💡 Giải pháp: Phù hợp cho các vùng rẫy xa khu dân cư. Tích hợp bơm hỏa tiễn DC/AC hiệu suất cao.",
    coverBg: "bg-blue-600",
  },
  "may-bom-nuoc": {
    title: "Máy Bơm Nước Nông Nghiệp Công Suất Cao",
    description:
      "Đa dạng các dòng bơm hỏa tiễn, bơm ly tâm, bơm đẩy cao và bơm lưu lượng. Trái tim của mọi hệ thống tưới tiêu.",
    techTip:
      "💡 Kỹ thuật: Hãy dùng \"Máy tính Thủy lực\" của chúng tôi để chọn đúng công suất HP, tránh hụt nước hoặc vỡ ống.",
    coverBg: "bg-cyan-700",
  },

  // ================= 3. TƯỚI NHỎ GIỌT =================
  "ong-tuoi-nho-giot": {
    title: "Ống Tưới Nhỏ Giọt Trải Dọc Luống",
    description:
      "Giải pháp tưới tiết kiệm nước số 1 thế giới. Ứng dụng hoàn hảo cho cây công nghiệp trồng theo luống, mía, mì, và hoa màu.",
    techTip:
      "💡 Tiêu chuẩn: Công nghệ chống tắc nghẽn (Anti-clogging) tiên tiến, đảm bảo đồng đều 100% lượng nước mọi gốc.",
    coverBg: "bg-teal-700",
  },
  "dau-tuoi-nho-giot": {
    title: "Đầu Tưới Nhỏ Giọt Bù Áp",
    description:
      "Sản phẩm nhập khẩu Israel/Châu Âu. Chức năng bù áp (PC) giúp lưu lượng nước ra cực chuẩn dù rẫy có độ dốc chênh lệch lớn.",
    techTip:
      "💡 Thiết kế: Đặc biệt phù hợp cho các nông trại trồng cây trong chậu, bầu giá thể hoặc vườn ươm.",
    coverBg: "bg-emerald-600",
  },

  // ================= 4. TƯỚI PHUN MƯA =================
  "bec-tuoi-phun-mua": {
    title: "Béc Tưới Phun Mưa Cục Bộ Cây Ăn Trái",
    description:
      "Cung cấp độ ẩm lan tỏa đều quanh vùng rễ hoạt động. Tích hợp ngàm chỉnh bán kính, dễ dàng thu hẹp khi cây nhỏ và mở rộng khi cây trưởng thành.",
    techTip:
      "💡 Tính năng: Các dòng béc cao cấp có tính năng chống côn trùng (Rotor thụt lùi) và ngàm chống xoay.",
    coverBg: "bg-sky-600",
  },
  "sung-tuoi-phun-mua": {
    title: "Súng Tưới Phun Mưa Bán Kính Lớn",
    description:
      "Chuyên trị các cánh đồng rộng lớn, đồi cỏ, bắp, mía, cà phê. Bán kính tưới có thể lên đến 50m, tích hợp cơ chế xoay tự động.",
    techTip:
      "💡 Lưu ý áp lực: Súng tưới yêu cầu máy bơm công suất lớn và áp lực nước cao để xé tơi hạt nước.",
    coverBg: "bg-indigo-600",
  },

  // ================= 5. BỘ TRUNG TÂM & ĐIỀU KHIỂN =================
  "bo-dieu-khien": {
    title: "Tủ Điều Khiển Tưới Thông Minh (IoT)",
    description:
      "Chuyển đổi số nông trại của bạn. Cho phép điều khiển máy bơm, van điện từ từ xa qua Smartphone. Tích hợp cảm biến độ ẩm đất.",
    techTip:
      "💡 Nâng cấp: Có thể cài đặt kịch bản tưới tự động theo giờ hoặc theo độ ẩm môi trường.",
    coverBg: "bg-gray-800",
  },
  "loc-he-thong-tuoi": {
    title: "Bộ Lọc Đĩa & Lọc Cát Trung Tâm",
    description:
      "Lá chắn bảo vệ toàn bộ hệ thống béc tưới. Loại bỏ rêu, cát, cặn bẩn từ nguồn nước ao hồ, sông suối.",
    techTip: "💡 Kỹ thuật: Bắt buộc phải có trong hệ thống tưới nhỏ giọt. Nên chọn cỡ lọc 120-130 micron.",
    coverBg: "bg-slate-700",
  },
  "thiet-bi-cham-phan": {
    title: "Hệ Thống Châm Phân Tự Động (Fertigation)",
    description:
      "Bộ châm phân Venturi và Bơm định lượng Dosatron. Hòa tan phân bón vào đường ống tưới, đưa dinh dưỡng đến thẳng miệng rễ.",
    techTip:
      "💡 Tiết kiệm: Giảm 90% chi phí nhân công rải phân và hạn chế tối đa sự thất thoát phân bón do bốc hơi.",
    coverBg: "bg-fuchsia-700",
  },

  // ================= 6. ỐNG DẪN NƯỚC =================
  "ong-hdpe": {
    title: "Ống Chính HDPE Dẫn Nước Áp Lực Cao",
    description:
      "Siêu bền, chịu lực tốt, chống tia UV. Là hệ thống \"huyết mạch\" trung tâm vận chuyển nước cho các dự án nông nghiệp hàng chục hecta.",
    techTip: "💡 Lắp đặt: Khuyến nghị chôn ngầm dưới đất để tăng tuổi thọ lên trên 50 năm.",
    coverBg: "bg-zinc-800",
  },
  "ong-ldpe": {
    title: "Ống Nhánh LDPE Tưới Cây Nông Nghiệp",
    description:
      "Mềm dẻo, dễ uốn cong, thi công cực kỳ nhanh chóng. Là đường ống nhánh rẽ vào từng luống cây, cho phép đục lỗ gắn béc trực tiếp.",
    techTip: "💡 Chất lượng: Sản phẩm sử dụng nhựa nguyên sinh 100%, tuổi thọ ngoài nắng từ 7-10 năm.",
    coverBg: "bg-stone-700",
  },
};

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeSlug(slug: string) {
  try {
    return decodeURIComponent(slug).toLowerCase();
  } catch {
    return slug.toLowerCase();
  }
}

function getCategoryLabel(slug: string) {
  if (slug === "tat-ca") return "Tất cả sản phẩm";
  if (slug === "may-bay-nong-nghiep") return "Máy bay nông nghiệp";
  if (slug === "humic-fulvic") return "Humic/Fulvic";

  const bySub = PRODUCTS_DATA.find((product) => slugify(product.subCategory) === slug);
  if (bySub) return bySub.subCategory;

  const byCategory = PRODUCTS_DATA.find((product) => slugify(product.category) === slug);
  if (byCategory) {
    const map: Record<string, string> = {
      DRONE: "Máy bay nông nghiệp",
      FERTILIZER: "Dinh dưỡng & Phân bón",
      HARDWARE: "Thiết bị & Vật tư tưới",
      SOLAR: "Điện mặt trời",
    };
    return map[byCategory.category] ?? byCategory.category;
  }

  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getFilteredProducts(slug: string) {
  if (slug === "tat-ca") return PRODUCTS_DATA;
  if (slug === "may-bay-nong-nghiep") return PRODUCTS_DATA.filter((product) => product.category === "DRONE");
  if (slug === "humic-fulvic") return PRODUCTS_DATA.filter((product) => product.subCategory === "Humic/Fulvic");

  return PRODUCTS_DATA.filter(
    (product) => slugify(product.subCategory) === slug || slugify(product.category) === slug,
  );
}

function getCategoryMeta(slug: string, fallbackLabel: string) {
  return (
    CATEGORY_META[slug] ?? {
      title: fallbackLabel,
      description:
        "Danh mục vật tư và thiết bị nông nghiệp được tối ưu theo từng bài toán canh tác thực tế, hỗ trợ triển khai nhanh tại vườn.",
      techTip: "💡 Kỹ thuật: Liên hệ kỹ sư Nhà Bè Agri để tư vấn cấu hình phù hợp địa hình và nguồn nước.",
      coverBg: "bg-green-700",
    }
  );
}

export function generateMetadata({ params }: CategoryPageProps): Metadata {
  const slug = normalizeSlug(params.slug);
  const categoryLabel = getCategoryLabel(slug);
  const categoryMeta = getCategoryMeta(slug, categoryLabel);

  return {
    title: `Danh mục: ${categoryMeta.title} - Vật tư Nông nghiệp | Nhà Bè Agri`,
    description: categoryMeta.description,
    alternates: {
      canonical: `/danh-muc/${slug}`,
    },
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const slug = normalizeSlug(params.slug);
  const categoryLabel = getCategoryLabel(slug);
  const categoryMeta = getCategoryMeta(slug, categoryLabel);
  const filteredProducts = getFilteredProducts(slug);
  const brands = Array.from(new Set(filteredProducts.map((product) => product.brand))).sort();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header>
          <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-900">
              Trang chủ
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/danh-muc/tat-ca" className="hover:text-gray-900">
              Danh mục
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-gray-900">{categoryLabel}</span>
          </nav>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
            {categoryLabel} ({filteredProducts.length} sản phẩm)
          </h1>
        </header>

        <section className={`mt-6 overflow-hidden rounded-2xl ${categoryMeta.coverBg} p-6 text-white shadow-sm md:p-8`}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Category Landing</p>
          <h2 className="mt-2 text-2xl font-extrabold leading-tight md:text-3xl">{categoryMeta.title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/90 md:text-base">{categoryMeta.description}</p>
          <div className="mt-4 inline-flex rounded-xl bg-white/15 px-4 py-2 text-sm text-white ring-1 ring-white/20">
            {categoryMeta.techTip}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <section className="bg-white rounded-xl shadow-sm p-5 space-y-6">
                <h2 className="text-base font-bold text-gray-900">Bộ lọc sản phẩm</h2>

                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Thương hiệu</h3>
                  <div className="space-y-2">
                    {(brands.length ? brands : ["DJI", "Haifa", "Rivulis", "AGtek"]).map((brand) => (
                      <label key={brand} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                        <span>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Mức giá</h3>
                  <div className="space-y-2">
                    {["Dưới 1 triệu", "1-5 triệu", "Trên 5 triệu"].map((range) => (
                      <label key={range} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                        <span>{range}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </aside>

          <section className="lg:col-span-3">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <PackageSearch className="h-8 w-8" />
                </div>
                <p className="mt-4 text-base text-gray-600 md:text-lg">
                  Hiện tại danh mục này đang được cập nhật sản phẩm mới. Bà con vui lòng quay lại sau nhé!
                </p>
                <Link
                  href="/danh-muc/tat-ca"
                  className="mt-6 inline-flex items-center rounded-xl bg-green-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-800"
                >
                  Xem tất cả sản phẩm
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
