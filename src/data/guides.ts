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
    title: "Cam Nang Canh Tac Sau Rieng Tu A-Z",
    description:
      "Tron bo ky thuat tu khau lam dat, cham soc cay con den xu ly ra hoa nghich vu va nuoi trai.",
    image: "/images/guides/sau-rieng-cover.jpg",
    chapters: [
      { step: 1, title: "Phan 1: Chuan bi dat, thiet ke ray va chon giong", slug: "phan-1-chuan-bi-dat" },
      { step: 2, title: "Phan 2: Ky thuat cham soc giai doan kien thiet (Nam 1-3)", slug: "phan-2-kien-thiet" },
      { step: 3, title: "Phan 3: Siet nuoc, lam bong va xu ly ra hoa", slug: "phan-3-lam-bong" },
      { step: 4, title: "Phan 4: Nuoi trai, chong rung sinh ly va suong mui", slug: "phan-4-nuoi-trai" },
      { step: 5, title: "Phan 5: Phuc hoi vuon sau rieng sau thu hoach", slug: "phan-5-phuc-hoi" },
    ],
  },
  {
    slug: "ca-phe",
    title: "So Tay Ky Thuat Ca Phe Ben Vung",
    description:
      "Lo trinh quan ly nuoc, dinh duong, cat tia va phong benh cho vuon ca phe tu giai doan co ban den kinh doanh.",
    image: "/images/guides/ca-phe-cover.jpg",
    chapters: [
      { step: 1, title: "Phan 1: Danh gia dat va thiet ke he thong tuoi", slug: "phan-1-danh-gia-dat" },
      { step: 2, title: "Phan 2: Quan ly dinh duong va cham phan theo mua", slug: "phan-2-cham-phan" },
      { step: 3, title: "Phan 3: Chong han va toi uu nang suat giai doan nuoi qua", slug: "phan-3-chong-han" },
    ],
  },
  {
    slug: "tieu",
    title: "Lo Trinh Cham Soc Cay Tieu Toan Dien",
    description:
      "Tong hop ky thuat dat tru, quan ly am do, bo sung trung-vi luong va phong benh chet nhanh chet cham.",
    image: "/images/guides/tieu-cover.jpg",
    chapters: [
      { step: 1, title: "Phan 1: Chon dat va thiet lap tru tieu", slug: "phan-1-thiet-lap-tru" },
      { step: 2, title: "Phan 2: Tuoi nho giot va bo sung huu co vi sinh", slug: "phan-2-tuoi-va-huu-co" },
      { step: 3, title: "Phan 3: Lich phong benh theo mua mua-kho", slug: "phan-3-phong-benh" },
    ],
  },
];
