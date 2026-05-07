/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  NEW LEAD EMAIL TEMPLATE - React Email                            ║
 * ║  Email notification sent to dealer when a new lead is assigned     ║
 * ║  Nhà Bè Agri O2O Lead Management System                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════╝
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

/* ═══════════════════════════════════════════════════════════════════════════════
 * PROPS INTERFACE
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface NewLeadEmailProps {
  dealerName: string;
  customerName?: string;
  customerPhone: string;
  province?: string;
  district?: string;
  cropType?: string;
  areaHa?: number;
  dashboardUrl: string;
  leadId: string;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════════ */

const BRAND_COLOR = "#059669"; // emerald-600
const BRAND_COLOR_LIGHT = "#d1fae5"; // emerald-100
const TEXT_COLOR = "#1f2937"; // gray-800
const MUTED_COLOR = "#6b7280"; // gray-500
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nhaBeAgri.vn";

/* ═══════════════════════════════════════════════════════════════════════════════
 * EMAIL COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export function NewLeadEmail({
  dealerName,
  customerName,
  customerPhone,
  province,
  district,
  cropType,
  areaHa,
  dashboardUrl,
  leadId,
}: NewLeadEmailProps) {
  const currentDate = format(new Date(), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi });
  const displayName = customerName || "Khách hàng mới";
  const location = [district, province].filter(Boolean).join(", ") || "Chưa cung cấp";
  const areaDisplay = areaHa ? `${areaHa.toFixed(2)} ha` : "Chưa cung cấp";

  return (
    <Html>
      <Head />
      <Preview>
        Nhà Bè Agri: Bạn có Lead mới từ {displayName} ({province || "N/A"})
      </Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Row>
              <Text style={styles.logo}>🌾 Nhà Bè Agri</Text>
            </Row>
            <Heading style={styles.headerTitle}>Lead Mới Được Phân Bổ</Heading>
            <Text style={styles.headerSubtitle}>
              Bạn vừa nhận được một Lead tiềm năng từ khu vực của bạn
            </Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Greeting */}
          <Section style={styles.section}>
            <Text style={styles.greeting}>Xin chào {dealerName},</Text>
            <Text style={styles.text}>
              Hệ thống Nhà Bè Agri đã phân bổ cho bạn một Lead mới từ{" "}
              <strong>{province || "khu vực của bạn"}</strong>.
            </Text>
          </Section>

          {/* Lead Details Card */}
          <Section style={styles.card}>
            <Heading style={styles.cardTitle}>📋 Thông Tin Lead</Heading>

            <Row style={styles.detailRow}>
              <Text style={styles.detailLabel}>Khách hàng:</Text>
              <Text style={styles.detailValue}>{displayName}</Text>
            </Row>

            <Row style={styles.detailRow}>
              <Text style={styles.detailLabel}>Số điện thoại:</Text>
              <Text style={styles.detailValue}>
                <Link href={`tel:${customerPhone}`} style={styles.phoneLink}>
                  {customerPhone}
                </Link>
              </Text>
            </Row>

            <Row style={styles.detailRow}>
              <Text style={styles.detailLabel}>Khu vực:</Text>
              <Text style={styles.detailValue}>{location}</Text>
            </Row>

            {cropType && (
              <Row style={styles.detailRow}>
                <Text style={styles.detailLabel}>Loại cây trồng:</Text>
                <Text style={styles.detailValue}>{cropType}</Text>
              </Row>
            )}

            <Row style={styles.detailRow}>
              <Text style={styles.detailLabel}>Diện tích:</Text>
              <Text style={styles.detailValue}>{areaDisplay}</Text>
            </Row>

            <Row style={styles.detailRow}>
              <Text style={styles.detailLabel}>Thời gian nhận:</Text>
              <Text style={styles.detailValue}>{currentDate}</Text>
            </Row>

            <Row style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mã Lead:</Text>
              <Text style={styles.detailValueSmall}>#{leadId.slice(0, 8)}...</Text>
            </Row>
          </Section>

          {/* CTA Button */}
          <Section style={styles.ctaSection}>
            <Text style={styles.ctaText}>
              Nhấn vào nút bên dưới để xem chi tiết dự toán vật tư (BOM) và liên hệ khách hàng ngay:
            </Text>
            <Button
              href={dashboardUrl}
              style={styles.ctaButton}
            >
              Xem Chi Tiết & Liên Hệ Khách Hàng
            </Button>
          </Section>

          <Hr style={styles.divider} />

          {/* Tips */}
          <Section style={styles.section}>
            <Heading style={styles.tipsTitle}>💡 Mẹo xử lý Lead hiệu quả</Heading>
            <ul style={styles.tipsList}>
              <li style={styles.tipsItem}>Liên hệ khách hàng trong vòng 24 giờ để tăng tỷ lệ chuyển đổi</li>
              <li style={styles.tipsItem}>Chuẩn bị mẫu BOM phù hợp với loại cây trồng và diện tích</li>
              <li style={styles.tipsItem}>Cập nhật trạng thái Lead thường xuyên để theo dõi</li>
            </ul>
          </Section>

          <Hr style={styles.divider} />

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Email này được gửi tự động từ hệ thống Nhà Bè Agri.
            </Text>
            <Text style={styles.footerText}>
              Vui lòng không trả lời trực tiếp email này.
            </Text>
            <Link href={APP_URL} style={styles.footerLink}>
              Truy cập Nhà Bè Agri Dashboard
            </Link>
            <Text style={styles.footerMuted}>
              © {new Date().getFullYear()} Nhà Bè Agri. Hệ thống O2O quản lý khách hàng tiềm năng.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * STYLES
 * ═══════════════════════════════════════════════════════════════════════════════ */

const styles = {
  body: {
    backgroundColor: "#f3f4f6",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "40px 20px",
    maxWidth: "600px",
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  header: {
    backgroundColor: BRAND_COLOR,
    margin: "-40px -20px 0",
    padding: "40px 30px 30px",
    borderRadius: "12px 12px 0 0",
    textAlign: "center" as const,
  },
  logo: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#ffffff",
    margin: "0 0 10px 0",
  },
  headerTitle: {
    fontSize: "26px",
    fontWeight: "bold",
    color: "#ffffff",
    margin: "0 0 10px 0",
  },
  headerSubtitle: {
    fontSize: "14px",
    color: "#d1fae5",
    margin: "0",
  },
  divider: {
    borderColor: "#e5e7eb",
    margin: "30px 0",
  },
  section: {
    padding: "0 10px",
  },
  greeting: {
    fontSize: "16px",
    color: TEXT_COLOR,
    margin: "0 0 15px 0",
  },
  text: {
    fontSize: "15px",
    color: TEXT_COLOR,
    lineHeight: "1.6",
    margin: "0 0 20px 0",
  },
  card: {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "25px",
    margin: "20px 0",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: TEXT_COLOR,
    margin: "0 0 20px 0",
  },
  detailRow: {
    marginBottom: "12px",
  },
  detailLabel: {
    fontSize: "14px",
    color: MUTED_COLOR,
    width: "140px",
    display: "inline-block",
    margin: "0",
  },
  detailValue: {
    fontSize: "15px",
    color: TEXT_COLOR,
    fontWeight: "500",
    margin: "0",
  },
  detailValueSmall: {
    fontSize: "13px",
    color: MUTED_COLOR,
    fontFamily: "monospace",
    margin: "0",
  },
  phoneLink: {
    color: BRAND_COLOR,
    textDecoration: "none",
    fontWeight: "600",
  },
  ctaSection: {
    textAlign: "center" as const,
    padding: "10px 0",
  },
  ctaText: {
    fontSize: "14px",
    color: MUTED_COLOR,
    margin: "0 0 20px 0",
  },
  ctaButton: {
    backgroundColor: BRAND_COLOR,
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    padding: "14px 28px",
    textDecoration: "none",
    display: "inline-block",
  },
  tipsTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: TEXT_COLOR,
    margin: "0 0 15px 0",
  },
  tipsList: {
    paddingLeft: "20px",
    margin: "0",
  },
  tipsItem: {
    fontSize: "14px",
    color: MUTED_COLOR,
    lineHeight: "1.8",
    margin: "0 0 5px 0",
  },
  footer: {
    textAlign: "center" as const,
    padding: "10px 0",
  },
  footerText: {
    fontSize: "13px",
    color: MUTED_COLOR,
    margin: "0 0 8px 0",
  },
  footerLink: {
    fontSize: "13px",
    color: BRAND_COLOR,
    textDecoration: "none",
    display: "inline-block",
    marginBottom: "15px",
  },
  footerMuted: {
    fontSize: "12px",
    color: "#9ca3af",
    margin: "10px 0 0 0",
  },
};

/* ═══════════════════════════════════════════════════════════════════════════════
 * EXPORT DEFAULT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default NewLeadEmail;
