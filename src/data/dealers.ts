export type DealerType = "office" | "dealer";

export type Dealer = {
  id: string;
  name: string;
  type: DealerType;
  region: string;
  address: string;
  phone: string;
  time: string;
  lat: number;
  lng: number;
  slug: string;
};

export const DEALERS_DATA: Dealer[] = [
  { id: "1", name: "NHÀ BÈ AGRI || HỒ CHÍ MINH HEAD OFFICE", type: "office", region: "Miền Nam", address: "Số 25, Khu Biệt Thự Ngân Long, Đường Nguyễn Hữu Thọ, X. Phước Kiển, H. Nhà Bè, TP. HCM", phone: "0983230879", time: "8h00-17h00", lat: 10.7208, lng: 106.7027, slug: "nha-be-agri-hcm" },
  { id: "2", name: "NHÀ BÈ AGRI || VP GIA LAI", type: "office", region: "Tây Nguyên", address: "556 Trường Chinh, Phường Chi Lăng, TP. Pleiku, Gia Lai", phone: "0969070077", time: "08h00-17h00", lat: 13.9798, lng: 108.0069, slug: "nha-be-agri-gia-lai" },
  { id: "3", name: "NHÀ BÈ AGRI || VP ĐĂK LẮK", type: "office", region: "Tây Nguyên", address: "Ngã 3 KoretVina, Thôn 13, Xã PơngDrang, Krông Búk, Đắk Lắk", phone: "0348877939", time: "8h00 - 17h00", lat: 12.9304, lng: 108.2321, slug: "nha-be-agri-dak-lak" },
  { id: "4", name: "NHÀ BÈ AGRI || VP LÂM ĐỒNG", type: "office", region: "Tây Nguyên", address: "21 Nguyễn Thị Định, Đức Trọng, Lâm Đồng", phone: "0355430003", time: "8h00 - 17h00", lat: 11.7582, lng: 108.3697, slug: "nha-be-agri-lam-dong" },
  { id: "5", name: "NHÀ BÈ AGRI || VP HÀ NỘI", type: "office", region: "Miền Bắc", address: "TT11-04, ngõ 22 Cửu Việt, Trâu Quỳ, Gia Lâm, Hà Nội", phone: "0944961555", time: "8h00 - 17h00", lat: 21.0116, lng: 105.9324, slug: "nha-be-agri-ha-noi" },
  { id: "6", name: "NHÀ BÈ AGRI || VP ĐỒNG NAI", type: "office", region: "Miền Nam", address: "QL56, Duyên Lãng, Cẩm Mỹ, Đồng Nai", phone: "0345791468", time: "8h00 - 17h00", lat: 10.8256, lng: 107.3190, slug: "nha-be-agri-dong-nai" },
  { id: "7", name: "DRIPTEC THẾ ANH", type: "dealer", region: "Miền Trung", address: "Thôn Eamkeng, Xã Eabar, Huyện Sông Hinh, Tỉnh Phú Yên", phone: "0346888599", time: "Mở cửa ban ngày", lat: 12.9515, lng: 108.9959, slug: "driptec-the-anh" },
  { id: "8", name: "DRIPTEC HỮU THIỆN", type: "dealer", region: "Tây Nguyên", address: "Km46, thị trấn Pơ Drang, Krông Búk, Đak Lak", phone: "0944764008", time: "Mở cửa ban ngày", lat: 12.9234, lng: 108.2400, slug: "driptec-huu-thien" },
  { id: "9", name: "Đại lý Nông Hưng", type: "dealer", region: "Tây Nguyên", address: "7J46+X6F Đắk Song, Đắk Nông", phone: "Đang cập nhật", time: "Mở cửa ban ngày", lat: 12.2133, lng: 107.6966, slug: "nong-hung-dak-nong" },
  { id: "10", name: "CÔNG TY TNHH GIẢI PHÁP CÔNG NGHỆ ỨNG DỤNG", type: "dealer", region: "Miền Tây", address: "77-79 Nguyễn Đình Chiểu, Phường 1, TP. Cao Lãnh, Đồng Tháp", phone: "0945810810", time: "Mở cửa ban ngày", lat: 10.4578, lng: 105.6320, slug: "giai-phap-cong-nghe-dong-thap" },
  { id: "11", name: "Cửa hàng Thái Lợi", type: "dealer", region: "Tây Nguyên", address: "386 Hùng Vương, Thị trấn Phú Thiện, Gia Lai", phone: "0963750153", time: "Mở cửa ban ngày", lat: 13.4100, lng: 108.2500, slug: "thai-loi-gia-lai" },
  { id: "12", name: "Cửa hàng Gia Bách", type: "dealer", region: "Miền Nam", address: "Ấp 7, xã Xuân Tây, Cẩm Mỹ, Đồng Nai", phone: "0343954508", time: "Mở cửa ban ngày", lat: 10.8300, lng: 107.3200, slug: "gia-bach-dong-nai" },
  { id: "13", name: "Thế giới điện nước Đắk Nông", type: "dealer", region: "Tây Nguyên", address: "205 Quang Trung, Nghĩa Tân, Gia Nghĩa, Đắk Nông", phone: "0358722799", time: "Mở cửa ban ngày", lat: 11.9900, lng: 107.6900, slug: "dien-nuoc-dak-nong" },
  { id: "14", name: "Cửa hàng Quốc Tú", type: "dealer", region: "Miền Nam", address: "Khu Đức Thọ, TT. Đức Phong, Bù Đăng, Bình Phước", phone: "0834560958", time: "Mở cửa ban ngày", lat: 11.8100, lng: 107.2500, slug: "quoc-tu-binh-phuoc" },
  { id: "15", name: "Đại lí Thành Nhung", type: "dealer", region: "Miền Nam", address: "Số 16 Ấp, Hội Phú, Tân Châu, Tây Ninh", phone: "0909764059", time: "Mở cửa ban ngày", lat: 11.5800, lng: 106.1300, slug: "thanh-nhung-tay-ninh" },
  { id: "16", name: "Cửa hàng điện nước Lâm Tuấn", type: "dealer", region: "Miền Nam", address: "113 ĐT713, Đức Hạnh, Đức Linh, Bình Thuận", phone: "0787558332", time: "Mở cửa ban ngày", lat: 11.1600, lng: 107.5700, slug: "lam-tuan-binh-thuan" },
  { id: "17", name: "HKD Điện Nước Quốc Thọ", type: "dealer", region: "Miền Nam", address: "Tổ 04, Ấp 07, Xã Tân Thành, Tây Ninh", phone: "0389655652", time: "Mở cửa ban ngày", lat: 11.5900, lng: 106.1400, slug: "quoc-tho-tay-ninh" },
  { id: "18", name: "CÔNG TY TNHH GIẢI PHÁP AUTOTUTUOI", type: "dealer", region: "Miền Nam", address: "160 Hương lộ 15, Ấp 5, Xã Thạnh Phú, Vĩnh Cửu, Đồng Nai", phone: "0355863232", time: "Mở cửa ban ngày", lat: 11.0100, lng: 107.0100, slug: "autotutuoi-dong-nai" },
  { id: "19", name: "CÔNG TY TNHH MTV SẢN XUẤT TM DV THÁI VIỆT", type: "dealer", region: "Miền Nam", address: "Số 62 đường số 6, phường An Lạc, TP. HCM", phone: "0908881880", time: "Mở cửa ban ngày", lat: 10.7300, lng: 106.6200, slug: "thai-viet-hcm" },
  { id: "20", name: "CH NPP LỄ HẠT GIỐNG", type: "dealer", region: "Miền Trung", address: "213 QL1A, TT. Phú Long, Hàm Thuận Bắc, Bình Thuận", phone: "0917872111", time: "Mở cửa ban ngày", lat: 11.0200, lng: 108.1200, slug: "le-hat-giong-binh-thuan" },
  { id: "21", name: "CÔNG TY TNHH TM XD VÀ MÔI TRƯỜNG CÔNG RÔ", type: "dealer", region: "Miền Trung", address: "Đường Nguyễn Văn Nhu, Mỹ Bình, Phan Rang-Tháp Chàm, Ninh Thuận", phone: "0931223334", time: "Mở cửa ban ngày", lat: 11.5800, lng: 108.9800, slug: "cong-ro-ninh-thuan" },
  { id: "22", name: "CH Điện Nước Nga Quý", type: "dealer", region: "Miền Nam", address: "Tổ 6, Ấp 6, Xuân Tây, Cẩm Mỹ, Đồng Nai", phone: "0988290624", time: "Mở cửa ban ngày", lat: 10.8400, lng: 107.3300, slug: "nga-quy-dong-nai" },
  { id: "23", name: "Cửa hàng điện nước Hoà Thành", type: "dealer", region: "Miền Nam", address: "TT. Định Quán, Định Quán, Đồng Nai", phone: "0928895724", time: "Mở cửa ban ngày", lat: 11.2000, lng: 107.2600, slug: "hoa-thanh-dong-nai" },
  { id: "24", name: "Cửa hàng vật tư nông nghiệp Trường Giang", type: "dealer", region: "Miền Trung", address: "103 DT720, thôn 8, Gia An, Tánh Linh, Bình Thuận", phone: "0868091762", time: "Mở cửa ban ngày", lat: 11.1400, lng: 107.6900, slug: "truong-giang-binh-thuan" },
  { id: "25", name: "Cửa Hàng Hà Phường 2", type: "dealer", region: "Miền Trung", address: "492 Lê Duẩn, Khu phố 7, Xã Ninh Sơn, Khánh Hòa", phone: "Đang cập nhật", time: "Mở cửa ban ngày", lat: 12.5200, lng: 109.1100, slug: "ha-phuong-khanh-hoa" },
];
