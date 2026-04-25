/**
 * vnAdministrative.ts
 * Offline-first: Cấu trúc hành chính Việt Nam (Tỉnh → Huyện → Xã)
 * Tập trung vào các tỉnh nông nghiệp trọng điểm Tây Nguyên & Đồng Bằng SCL.
 * Dữ liệu mock — sẽ thay bằng file JSON từ data.gov.vn hoặc API Supabase khi có.
 */

export interface Ward {
  code: string;
  name: string;
}

export interface District {
  code: string;
  name: string;
  wards: Ward[];
}

export interface Province {
  code: string;
  name: string;
  region: string;
  districts: District[];
}

export const VN_PROVINCES: Province[] = [
  {
    code: 'daklak',
    name: 'Đắk Lắk',
    region: 'Tây Nguyên',
    districts: [
      {
        code: 'buonmathuot',
        name: 'TP. Buôn Ma Thuột',
        wards: [
          { code: 'eatam', name: 'Phường Ea Tam' },
          { code: 'khanh_xuan', name: 'Phường Khánh Xuân' },
          { code: 'tan_an', name: 'Phường Tân An' },
          { code: 'thanh_nhat', name: 'Phường Thành Nhất' },
          { code: 'tu_an', name: 'Phường Tự An' },
        ],
      },
      {
        code: 'cuMgar',
        name: 'Huyện Cư M\'gar',
        wards: [
          { code: 'cumgar_tt', name: 'TT. Cư M\'gar' },
          { code: 'cuebur', name: 'Xã Cuê Bur' },
          { code: 'ea_dring', name: 'Xã Ea Drăng' },
          { code: 'ea_tar', name: 'Xã Ea Tar' },
          { code: 'quang_hien', name: 'Xã Quảng Hiền' },
        ],
      },
      {
        code: 'dakLak_krong_buk',
        name: 'Huyện Krông Búk',
        wards: [
          { code: 'chu_kbuk', name: 'Xã Chư Kbô' },
          { code: 'ea_ngai', name: 'Xã Ea Ngai' },
          { code: 'ea_sin', name: 'Xã Ea Sin' },
          { code: 'pong_drang', name: 'Xã Pông Drang' },
        ],
      },
      {
        code: 'buon_ho',
        name: 'TX. Buôn Hồ',
        wards: [
          { code: 'an_binh', name: 'Phường An Bình' },
          { code: 'buon_ho_ward', name: 'Phường Buôn Hồ' },
          { code: 'thieu_hung', name: 'Xã Thiệu Hùng' },
        ],
      },
    ],
  },
  {
    code: 'lamdong',
    name: 'Lâm Đồng',
    region: 'Tây Nguyên',
    districts: [
      {
        code: 'dalat',
        name: 'TP. Đà Lạt',
        wards: [
          { code: 'ward1_dalat', name: 'Phường 1' },
          { code: 'ward3_dalat', name: 'Phường 3' },
          { code: 'ward7_dalat', name: 'Phường 7' },
          { code: 'ward10_dalat', name: 'Phường 10' },
          { code: 'xuan_tho', name: 'Xã Xuân Thọ' },
        ],
      },
      {
        code: 'bao_loc',
        name: 'TP. Bảo Lộc',
        wards: [
          { code: 'lộc_phat', name: 'Phường Lộc Phát' },
          { code: 'lộc_tien', name: 'Phường Lộc Tiến' },
          { code: 'b2_bao_loc', name: 'Phường 2' },
          { code: 'dambri', name: 'Xã Đam Bri' },
        ],
      },
      {
        code: 'di_linh',
        name: 'Huyện Di Linh',
        wards: [
          { code: 'di_linh_tt', name: 'TT. Di Linh' },
          { code: 'bao_thuan', name: 'Xã Bảo Thuận' },
          { code: 'dinh_lac', name: 'Xã Đinh Lạc' },
          { code: 'gia_hien', name: 'Xã Gia Hiên' },
        ],
      },
      {
        code: 'duc_trong',
        name: 'Huyện Đức Trọng',
        wards: [
          { code: 'lien_nghia', name: 'TT. Liên Nghĩa' },
          { code: 'hiep_an', name: 'Xã Hiệp An' },
          { code: 'lien_hiep', name: 'Xã Liên Hiệp' },
          { code: 'n_thon', name: 'Xã N\'Thôn Hạ' },
        ],
      },
    ],
  },
  {
    code: 'gialai',
    name: 'Gia Lai',
    region: 'Tây Nguyên',
    districts: [
      {
        code: 'pleiku',
        name: 'TP. Pleiku',
        wards: [
          { code: 'dien_hong', name: 'Phường Diên Hồng' },
          { code: 'phu_dong', name: 'Phường Phù Đổng' },
          { code: 'tay_son', name: 'Phường Tây Sơn' },
          { code: 'ia_kring', name: 'Xã Ia Kring' },
        ],
      },
      {
        code: 'chu_se',
        name: 'Huyện Chư Sê',
        wards: [
          { code: 'chu_se_tt', name: 'TT. Chư Sê' },
          { code: 'al_ba', name: 'Xã Al Ba' },
          { code: 'dun', name: 'Xã Dun' },
          { code: 'ia_blang', name: 'Xã Ia Blang' },
          { code: 'ia_glai', name: 'Xã Ia Glai' },
        ],
      },
      {
        code: 'mang_yang',
        name: 'Huyện Mang Yang',
        wards: [
          { code: 'kon_dong', name: 'TT. Kon Dơng' },
          { code: 'de_ar', name: 'Xã Đê Ar' },
          { code: 'ha_dong', name: 'Xã Hà Đông' },
        ],
      },
    ],
  },
  {
    code: 'daknong',
    name: 'Đắk Nông',
    region: 'Tây Nguyên',
    districts: [
      {
        code: 'gia_nghia',
        name: 'TP. Gia Nghĩa',
        wards: [
          { code: 'nghia_duc', name: 'Phường Nghĩa Đức' },
          { code: 'nghia_phu', name: 'Phường Nghĩa Phú' },
          { code: 'nghia_xuan', name: 'Xã Nghĩa Xuân' },
        ],
      },
      {
        code: 'dak_song',
        name: 'Huyện Đắk Song',
        wards: [
          { code: 'duc_an', name: 'TT. Đức An' },
          { code: 'dak_n_drung', name: 'Xã Đắk N\'Drung' },
          { code: 'nam_binh', name: 'Xã Nam Bình' },
          { code: 'thuan_ha', name: 'Xã Thuận Hà' },
        ],
      },
    ],
  },
  {
    code: 'dongnai',
    name: 'Đồng Nai',
    region: 'Đông Nam Bộ',
    districts: [
      {
        code: 'bien_hoa',
        name: 'TP. Biên Hòa',
        wards: [
          { code: 'an_binh_bh', name: 'Phường An Bình' },
          { code: 'buu_long', name: 'Phường Bửu Long' },
          { code: 'hoa_binh_bh', name: 'Phường Hòa Bình' },
          { code: 'trang_dai', name: 'Phường Trảng Dài' },
        ],
      },
      {
        code: 'xuan_loc',
        name: 'Huyện Xuân Lộc',
        wards: [
          { code: 'xuan_loc_tt', name: 'TT. Gia Ray' },
          { code: 'bao_hoa', name: 'Xã Bảo Hòa' },
          { code: 'lang_minh', name: 'Xã Lang Minh' },
          { code: 'xuan_hung', name: 'Xã Xuân Hưng' },
        ],
      },
      {
        code: 'dinh_quan',
        name: 'Huyện Định Quán',
        wards: [
          { code: 'dinh_quan_tt', name: 'TT. Định Quán' },
          { code: 'gia_canh', name: 'Xã Gia Canh' },
          { code: 'phu_ngoc', name: 'Xã Phú Ngọc' },
        ],
      },
    ],
  },
  {
    code: 'binhphuoc',
    name: 'Bình Phước',
    region: 'Đông Nam Bộ',
    districts: [
      {
        code: 'dong_xoai',
        name: 'TP. Đồng Xoài',
        wards: [
          { code: 'tan_binh_px', name: 'Phường Tân Bình' },
          { code: 'tan_dong', name: 'Phường Tân Đồng' },
          { code: 'tien_thanh', name: 'Xã Tiến Thành' },
        ],
      },
      {
        code: 'chon_thanh',
        name: 'Huyện Chơn Thành',
        wards: [
          { code: 'chon_thanh_tt', name: 'TT. Chơn Thành' },
          { code: 'minh_lap', name: 'Xã Minh Lập' },
          { code: 'minh_thanh', name: 'Xã Minh Thành' },
          { code: 'trung_lap', name: 'Xã Trung Lập' },
        ],
      },
    ],
  },
  {
    code: 'tiengiang',
    name: 'Tiền Giang',
    region: 'Đồng Bằng SCL',
    districts: [
      {
        code: 'my_tho',
        name: 'TP. Mỹ Tho',
        wards: [
          { code: 'ward1_mt', name: 'Phường 1' },
          { code: 'ward4_mt', name: 'Phường 4' },
          { code: 'ward6_mt', name: 'Phường 6' },
          { code: 'my_phu', name: 'Phường Mỹ Phú' },
        ],
      },
      {
        code: 'cai_lay',
        name: 'TX. Cai Lậy',
        wards: [
          { code: 'nhon_hoa', name: 'Phường Nhơn Hòa' },
          { code: 'long_khanh', name: 'Xã Long Khánh' },
          { code: 'tam_binh', name: 'Xã Tâm Bình' },
        ],
      },
      {
        code: 'chau_thanh_tg',
        name: 'Huyện Châu Thành',
        wards: [
          { code: 'tan_hiep_tg', name: 'TT. Tân Hiệp' },
          { code: 'binh_duc', name: 'Xã Bình Đức' },
          { code: 'duong_diem', name: 'Xã Dưỡng Điềm' },
          { code: 'long_hung_tg', name: 'Xã Long Hưng' },
        ],
      },
    ],
  },
  {
    code: 'dongthap',
    name: 'Đồng Tháp',
    region: 'Đồng Bằng SCL',
    districts: [
      {
        code: 'cao_lanh_city',
        name: 'TP. Cao Lãnh',
        wards: [
          { code: 'ward1_cl', name: 'Phường 1' },
          { code: 'ward4_cl', name: 'Phường 4' },
          { code: 'my_phu_cl', name: 'Phường Mỹ Phú' },
          { code: 'hoa_thuận', name: 'Xã Hòa Thuận' },
        ],
      },
      {
        code: 'sa_dec',
        name: 'TP. Sa Đéc',
        wards: [
          { code: 'ward2_sd', name: 'Phường 2' },
          { code: 'tan_quy_dong', name: 'Phường Tân Quy Đông' },
          { code: 'tan_khanh_dong', name: 'Xã Tân Khánh Đông' },
        ],
      },
    ],
  },
  {
    code: 'khanhhoa',
    name: 'Khánh Hòa',
    region: 'Duyên Hải Nam Trung Bộ',
    districts: [
      {
        code: 'nha_trang',
        name: 'TP. Nha Trang',
        wards: [
          { code: 'phuoc_hoa', name: 'Phường Phước Hòa' },
          { code: 'phuoc_tan', name: 'Phường Phước Tân' },
          { code: 'tan_lap', name: 'Phường Tân Lập' },
          { code: 'vinh_hai', name: 'Phường Vĩnh Hải' },
        ],
      },
      {
        code: 'cam_lam',
        name: 'Huyện Cam Lâm',
        wards: [
          { code: 'cam_duc', name: 'TT. Cam Đức' },
          { code: 'cam_hoa', name: 'Xã Cam Hòa' },
          { code: 'suoi_cat', name: 'Xã Suối Cát' },
        ],
      },
    ],
  },
  {
    code: 'binhthuan',
    name: 'Bình Thuận',
    region: 'Duyên Hải Nam Trung Bộ',
    districts: [
      {
        code: 'phan_thiet',
        name: 'TP. Phan Thiết',
        wards: [
          { code: 'duc_nghia', name: 'Phường Đức Nghĩa' },
          { code: 'phu_tri', name: 'Phường Phú Trinh' },
          { code: 'tien_thanh_bt', name: 'Xã Tiến Thành' },
        ],
      },
      {
        code: 'duc_linh',
        name: 'Huyện Đức Linh',
        wards: [
          { code: 'vo_xu', name: 'TT. Võ Xu' },
          { code: 'me_pu', name: 'Xã Mê Pu' },
          { code: 'nam_chinh', name: 'Xã Nam Chính' },
        ],
      },
    ],
  },
];

/** Tra cứu tỉnh theo code */
export const getProvince = (code: string) =>
  VN_PROVINCES.find((p) => p.code === code) ?? null;

/** Tra cứu huyện theo tỉnh-code + huyện-code */
export const getDistrict = (provinceCode: string, districtCode: string) =>
  getProvince(provinceCode)?.districts.find((d) => d.code === districtCode) ?? null;
