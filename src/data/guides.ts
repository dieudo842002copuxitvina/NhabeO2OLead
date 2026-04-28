export type GuideChapter = {
  step: number;
  title: string;
  slug: string;
};

export type GuideSeries = {
  slug: string;
  title: string;
  description: string;
  image: string;
  chapters: GuideChapter[];
};

export const GUIDES_DATA: GuideSeries[] = [
  {
    slug: "sau-rieng",
    title: "Cẩm Nang Canh Tác Sầu Riêng Từ A-Z",
    description:
      "Trọn bộ kỹ thuật từ khâu làm đất, chăm sóc cây con đến xử lý ra hoa nghịch vụ và nuôi trái.",
    image: "/images/guides/sau-rieng-cover.jpg",
    chapters: [
      { step: 1, title: "Phần 1: Chuẩn bị đất, thiết kế rẫy và chọn giống", slug: "phan-1-chuan-bi-dat" },
      { step: 2, title: "Phần 2: Kỹ thuật chăm sóc giai đoạn kiến thiết (Năm 1-3)", slug: "phan-2-kien-thiet" },
      { step: 3, title: "Phần 3: Siết nước, làm bông và xử lý ra hoa", slug: "phan-3-lam-bong" },
      { step: 4, title: "Phần 4: Nuôi trái, chống rụng sinh lý và sượng múi", slug: "phan-4-nuoi-trai" },
      { step: 5, title: "Phần 5: Phục hồi vườn sầu riêng sau thu hoạch", slug: "phan-5-phuc-hoi" },
    ],
  },
  {
    slug: "ca-phe",
    title: "Sổ Tay Kỹ Thuật Cà Phê Bền Vững",
    description:
      "Lộ trình quản lý nước, dinh dưỡng, cắt tỉa và phòng bệnh cho vườn cà phê từ giai đoạn cơ bản đến kinh doanh.",
    image: "/images/guides/ca-phe-cover.jpg",
    chapters: [
      { step: 1, title: "Phần 1: Đánh giá đất và thiết kế hệ thống tưới", slug: "phan-1-danh-gia-dat" },
      { step: 2, title: "Phần 2: Quản lý dinh dưỡng và châm phân theo mùa", slug: "phan-2-cham-phan" },
      { step: 3, title: "Phần 3: Chống hạn và tối ưu năng suất giai đoạn nuôi quả", slug: "phan-3-chong-han" },
    ],
  },
  {
    slug: "tieu",
    title: "Lộ Trình Chăm Sóc Cây Tiêu Toàn Diện",
    description:
      "Tổng hợp kỹ thuật đặt trụ, quản lý ẩm độ, bổ sung trung-vi lượng và phòng bệnh chết nhanh chết chậm.",
    image: "/images/guides/tieu-cover.jpg",
    chapters: [
      { step: 1, title: "Phần 1: Chọn đất và thiết lập trụ tiêu", slug: "phan-1-thiet-lap-tru" },
      { step: 2, title: "Phần 2: Tưới nhỏ giọt và bổ sung hữu cơ vi sinh", slug: "phan-2-tuoi-va-huu-co" },
      { step: 3, title: "Phần 3: Lịch phòng bệnh theo mùa mưa-khô", slug: "phan-3-phong-benh" },
    ],
  },
];
