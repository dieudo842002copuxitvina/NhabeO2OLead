export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null; // null nếu là Root Category (Tier 1)
  children?: Category[]; // Mảng chứa các danh mục con
}

export const FERTILIZER_CATEGORIES: Category[] = [
  {
    id: 'fertilizer-inorganic',
    name: 'Phân bón vô cơ',
    slug: 'phan-bon-vo-co',
    parentId: null,
    children: [
      {
        id: 'fertilizer-single-nutrient',
        name: 'Phân đơn',
        slug: 'phan-don',
        parentId: 'fertilizer-inorganic',
        children: [
          {
            id: 'fertilizer-nitrogen',
            name: 'Phân đạm',
            slug: 'phan-dam',
            parentId: 'fertilizer-single-nutrient',
          },
          {
            id: 'fertilizer-phosphate',
            name: 'Phân lân',
            slug: 'phan-lan',
            parentId: 'fertilizer-single-nutrient',
          },
          {
            id: 'fertilizer-potassium',
            name: 'Phân kali',
            slug: 'phan-kali',
            parentId: 'fertilizer-single-nutrient',
          },
        ],
      },
      {
        id: 'fertilizer-compound',
        name: 'Phân phức hợp và hỗn hợp',
        slug: 'phan-phuc-hop-hon-hop',
        parentId: 'fertilizer-inorganic',
        children: [
          {
            id: 'fertilizer-npk',
            name: 'NPK',
            slug: 'npk',
            parentId: 'fertilizer-compound',
          },
          {
            id: 'fertilizer-dap-map',
            name: 'DAP/MAP',
            slug: 'dap-map',
            parentId: 'fertilizer-compound',
          },
          {
            id: 'fertilizer-nk-pk',
            name: 'NK/PK',
            slug: 'nk-pk',
            parentId: 'fertilizer-compound',
          },
        ],
      },
      {
        id: 'fertilizer-secondary-micro',
        name: 'Trung lượng và vi lượng',
        slug: 'trung-luong-vi-luong',
        parentId: 'fertilizer-inorganic',
        children: [
          {
            id: 'fertilizer-secondary-elements',
            name: 'Canxi, Magie, Lưu huỳnh',
            slug: 'canxi-magie-luu-huynh',
            parentId: 'fertilizer-secondary-micro',
          },
          {
            id: 'fertilizer-micro-elements',
            name: 'Bo, Kẽm, Sắt, Đồng, Mangan',
            slug: 'bo-kem-sat-dong-mangan',
            parentId: 'fertilizer-secondary-micro',
          },
        ],
      },
    ],
  },
  {
    id: 'fertilizer-organic',
    name: 'Phân bón hữu cơ',
    slug: 'phan-bon-huu-co',
    parentId: null,
    children: [
      {
        id: 'fertilizer-traditional-organic',
        name: 'Hữu cơ truyền thống',
        slug: 'huu-co-truyen-thong',
        parentId: 'fertilizer-organic',
        children: [
          {
            id: 'fertilizer-manure',
            name: 'Phân chuồng ủ hoai',
            slug: 'phan-chuong-u-hoai',
            parentId: 'fertilizer-traditional-organic',
          },
          {
            id: 'fertilizer-compost-green',
            name: 'Compost và phân xanh',
            slug: 'compost-phan-xanh',
            parentId: 'fertilizer-traditional-organic',
          },
        ],
      },
      {
        id: 'fertilizer-industrial-organic',
        name: 'Hữu cơ công nghiệp',
        slug: 'huu-co-cong-nghiep',
        parentId: 'fertilizer-organic',
        children: [
          {
            id: 'fertilizer-organic-mineral',
            name: 'Hữu cơ khoáng',
            slug: 'huu-co-khoang',
            parentId: 'fertilizer-industrial-organic',
          },
          {
            id: 'fertilizer-organic-bio',
            name: 'Hữu cơ vi sinh',
            slug: 'huu-co-vi-sinh',
            parentId: 'fertilizer-industrial-organic',
          },
        ],
      },
      {
        id: 'fertilizer-soil-conditioner',
        name: 'Cải tạo đất',
        slug: 'cai-tao-dat',
        parentId: 'fertilizer-organic',
        children: [
          {
            id: 'fertilizer-humic-fulvic',
            name: 'Humic/Fulvic',
            slug: 'humic-fulvic',
            parentId: 'fertilizer-soil-conditioner',
          },
          {
            id: 'fertilizer-lime-gypsum',
            name: 'Vôi nông nghiệp/Gypsum',
            slug: 'voi-nong-nghiep-gypsum',
            parentId: 'fertilizer-soil-conditioner',
          },
        ],
      },
    ],
  },
  {
    id: 'fertilizer-biological',
    name: 'Phân bón sinh học',
    slug: 'phan-bon-sinh-hoc',
    parentId: null,
    children: [
      {
        id: 'fertilizer-microbial-nitrogen',
        name: 'Vi sinh cố định đạm',
        slug: 'vi-sinh-co-dinh-dam',
        parentId: 'fertilizer-biological',
        children: [
          {
            id: 'fertilizer-rhizobium',
            name: 'Rhizobium',
            slug: 'rhizobium',
            parentId: 'fertilizer-microbial-nitrogen',
          },
          {
            id: 'fertilizer-azotobacter',
            name: 'Azotobacter/Azospirillum',
            slug: 'azotobacter-azospirillum',
            parentId: 'fertilizer-microbial-nitrogen',
          },
        ],
      },
      {
        id: 'fertilizer-microbial-solubilizer',
        name: 'Vi sinh phân giải dinh dưỡng',
        slug: 'vi-sinh-phan-giai-dinh-duong',
        parentId: 'fertilizer-biological',
        children: [
          {
            id: 'fertilizer-phosphate-solubilizer',
            name: 'Phân giải lân',
            slug: 'phan-giai-lan',
            parentId: 'fertilizer-microbial-solubilizer',
          },
          {
            id: 'fertilizer-cellulose-solubilizer',
            name: 'Phân giải cellulose',
            slug: 'phan-giai-cellulose',
            parentId: 'fertilizer-microbial-solubilizer',
          },
        ],
      },
      {
        id: 'fertilizer-biostimulant',
        name: 'Chế phẩm kích thích sinh trưởng',
        slug: 'che-pham-kich-thich-sinh-truong',
        parentId: 'fertilizer-biological',
        children: [
          {
            id: 'fertilizer-amino-acid',
            name: 'Amino acid',
            slug: 'amino-acid',
            parentId: 'fertilizer-biostimulant',
          },
          {
            id: 'fertilizer-seaweed-extract',
            name: 'Chiết xuất rong biển',
            slug: 'chiet-xuat-rong-bien',
            parentId: 'fertilizer-biostimulant',
          },
        ],
      },
    ],
  },
  {
    id: 'fertilizer-by-application',
    name: 'Phân bón theo cách sử dụng',
    slug: 'phan-bon-theo-cach-su-dung',
    parentId: null,
    children: [
      {
        id: 'fertilizer-soil-application',
        name: 'Bón gốc',
        slug: 'bon-goc',
        parentId: 'fertilizer-by-application',
        children: [
          {
            id: 'fertilizer-base-dressing',
            name: 'Bón lót',
            slug: 'bon-lot',
            parentId: 'fertilizer-soil-application',
          },
          {
            id: 'fertilizer-top-dressing',
            name: 'Bón thúc',
            slug: 'bon-thuc',
            parentId: 'fertilizer-soil-application',
          },
        ],
      },
      {
        id: 'fertilizer-foliar',
        name: 'Phân bón lá',
        slug: 'phan-bon-la',
        parentId: 'fertilizer-by-application',
        children: [
          {
            id: 'fertilizer-foliar-npk',
            name: 'NPK bón lá',
            slug: 'npk-bon-la',
            parentId: 'fertilizer-foliar',
          },
          {
            id: 'fertilizer-foliar-micro',
            name: 'Vi lượng bón lá',
            slug: 'vi-luong-bon-la',
            parentId: 'fertilizer-foliar',
          },
        ],
      },
      {
        id: 'fertilizer-fertigation',
        name: 'Châm phân qua hệ thống tưới',
        slug: 'cham-phan-qua-he-thong-tuoi',
        parentId: 'fertilizer-by-application',
        children: [
          {
            id: 'fertilizer-water-soluble',
            name: 'Phân tan hoàn toàn',
            slug: 'phan-tan-hoan-toan',
            parentId: 'fertilizer-fertigation',
          },
          {
            id: 'fertilizer-liquid',
            name: 'Phân dạng lỏng',
            slug: 'phan-dang-long',
            parentId: 'fertilizer-fertigation',
          },
        ],
      },
    ],
  },
];

export const fertilizerTaxonomy = FERTILIZER_CATEGORIES;
