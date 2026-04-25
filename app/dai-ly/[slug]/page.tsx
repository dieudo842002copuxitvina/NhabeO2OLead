import { notFound } from "next/navigation";
import { MapPin, Users, Award } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import DealerContactCard from "@/components/DealerContactCard";
import FeaturedProducts from "@/components/FeaturedProducts";
import GoogleMapsEmbed from "@/components/GoogleMapsEmbed";
import SeoMeta from "@/components/SeoMeta";
import { dealersData } from "@/data/dealersData";
import type { Metadata } from "next";

interface DealerDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(
  { params }: DealerDetailPageProps
): Promise<Metadata> {
  const { slug } = await params;
  const dealer = dealersData.find(d => d.slug === slug);

  if (!dealer) {
    return {
      title: "Đại lý không tìm thấy",
      description: "Đại lý này không tồn tại.",
    };
  }

  const address = `${dealer.district}, ${dealer.province}`;
  const description = `${dealer.name} - Cung cấp giải pháp tưới tiêu chuyên nghiệp tại ${address}. Liên hệ: ${dealer.phone || "Không có"}`;

  return {
    title: `${dealer.name} - Nhà Bè Agri`,
    description,
    keywords: [`${dealer.name}`, "đại lý", "tưới tiêu", dealer.province, dealer.region],
    openGraph: {
      title: `${dealer.name} - Nhà Bè Agri`,
      description,
      type: "website",
      url: `https://nhabeagri.com/dai-ly/${dealer.slug}`,
    },
  };
}

export async function generateStaticParams() {
  return dealersData.map(dealer => ({
    slug: dealer.slug,
  }));
}

export default async function DealerDetailPage({ params }: DealerDetailPageProps) {
  const { slug } = await params;
  const dealer = dealersData.find(d => d.slug === slug);

  if (!dealer) {
    notFound();
  }

  const fullAddress = `${dealer.address || ""} ${dealer.district}, ${dealer.province}`;

  // Schema.org LocalBusiness JSON-LD
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: dealer.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: dealer.address || dealer.district,
      addressLocality: dealer.district,
      addressRegion: dealer.province,
      addressCountry: "VN",
    },
    telephone: dealer.phone || undefined,
    openingHoursSpecification: dealer.hours ? {
      "@type": "OpeningHoursSpecification",
      opens: dealer.hours.split("-")[0]?.trim() || "07:00",
      closes: dealer.hours.split("-")[1]?.trim() || "17:00",
    } : undefined,
    description: `Đại lý ủy quyền Nhà Bè Agri cung cấp giải pháp tưới tiêu và thiết bị nông nghiệp chuyên nghiệp.`,
    image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=400",
  };

  return (
    <>
      <SeoMeta 
        title={`${dealer.name} - Nhà Bè Agri`}
        description={`${dealer.name} - Cung cấp giải pháp tưới tiêu chuyên nghiệp tại ${dealer.province}. Liên hệ: ${dealer.phone || "Không có"}`}
      />

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Breadcrumb 
              items={[
                { label: "Đại lý", href: "/dai-ly" },
                { label: dealer.name },
              ]}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title */}
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <MapPin className="w-6 h-6 text-[#4CAF50]" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2 font-['Be_Vietnam_Pro'] leading-tight">
                      {dealer.name}
                    </h1>
                    <p className="text-lg text-slate-600 font-['Be_Vietnam_Pro']">
                      {dealer.region}
                    </p>
                  </div>
                </div>
              </div>

              {/* Maps Section */}
              <GoogleMapsEmbed 
                address={fullAddress} 
                title={dealer.name} 
              />

              {/* Service Introduction */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 font-['Be_Vietnam_Pro']">
                    Giới thiệu về chúng tôi
                  </h2>
                  <div className="prose prose-sm max-w-none font-['Be_Vietnam_Pro'] text-slate-700 leading-relaxed">
                    <p>
                      {dealer.name} là một trong những đại lý ủy quyền chính thức của Nhà Bè Agri, cung cấp giải pháp tưới tiêu hiện đại và thiết bị nông nghiệp chất lượng cao cho các nông trại và doanh nghiệp nông nghiệp tại {dealer.province}.
                    </p>
                    <p>
                      Với hơn 10 năm kinh nghiệm trong lĩnh vực tưới tiêu, chúng tôi cam kết mang đến những sản phẩm tốt nhất và dịch vụ hỗ trợ kỹ thuật chuyên sâu để giúp bạn tối ưu hóa năng suất nông nghiệp.
                    </p>
                  </div>
                </div>

                {/* Services Highlight */}
                {dealer.services && dealer.services.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 font-['Be_Vietnam_Pro']">
                      Dịch vụ chúng tôi cung cấp
                    </h3>
                    <ul className="space-y-2">
                      {dealer.services.map((service, idx) => (
                        <li 
                          key={idx}
                          className="flex gap-3 items-start p-3 bg-green-50 rounded-lg border border-green-200"
                        >
                          <div className="w-1.5 h-1.5 bg-[#4CAF50] rounded-full mt-2 flex-shrink-0" />
                          <span className="text-slate-700 font-['Be_Vietnam_Pro']">{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Why Choose Us */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 font-['Be_Vietnam_Pro']">
                    Tại sao chọn chúng tôi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-slate-200 rounded-lg hover:border-[#4CAF50] transition-colors">
                      <Users className="w-6 h-6 text-[#4CAF50] mb-3" />
                      <h4 className="font-bold text-slate-900 mb-2 font-['Be_Vietnam_Pro']">Đội ngũ chuyên nghiệp</h4>
                      <p className="text-sm text-slate-600 font-['Be_Vietnam_Pro']">
                        Nhân viên được đào tạo bài bản, sẵn sàng hỗ trợ bạn 24/7
                      </p>
                    </div>
                    <div className="p-4 border border-slate-200 rounded-lg hover:border-[#4CAF50] transition-colors">
                      <Award className="w-6 h-6 text-[#4CAF50] mb-3" />
                      <h4 className="font-bold text-slate-900 mb-2 font-['Be_Vietnam_Pro']">Sản phẩm chính hãng</h4>
                      <p className="text-sm text-slate-600 font-['Be_Vietnam_Pro']">
                        Toàn bộ sản phẩm là hàng chính hãng từ nhà sản xuất uy tín
                      </p>
                    </div>
                    <div className="p-4 border border-slate-200 rounded-lg hover:border-[#4CAF50] transition-colors">
                      <MapPin className="w-6 h-6 text-[#4CAF50] mb-3" />
                      <h4 className="font-bold text-slate-900 mb-2 font-['Be_Vietnam_Pro']">Vị trí chiến lược</h4>
                      <p className="text-sm text-slate-600 font-['Be_Vietnam_Pro']">
                        Tọa lạc tại vị trí dễ tiếp cận, phục vụ toàn khu vực
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="lg:col-span-1">
              <DealerContactCard dealer={dealer} />
            </div>
          </div>
        </div>

        {/* Featured Products Section */}
        <div className="bg-slate-50 border-t border-slate-200">
          <FeaturedProducts services={dealer.services} />
        </div>
      </div>
    </>
  );
}
