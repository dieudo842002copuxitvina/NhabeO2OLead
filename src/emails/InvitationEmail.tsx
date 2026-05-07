/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  INVITATION EMAIL TEMPLATE - React Email                            ║
 * ║  Email invitation sent to dealers/suppliers to join Nhà Bè Agri         ║
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

/* ═══════════════════════════════════════════════════════════════════════════════
 * PROPS INTERFACE
 * ═══════════════════════════════════════════════════════════════════════════════ */

interface InvitationEmailProps {
  invitedEmail: string;
  role: "dealer" | "supplier";
  roleLabel: string;
  invitedBy: string;
  acceptUrl: string;
  expiresDays?: number;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * CONSTANTS
 * ═══════════════════════════════════════════════════════════════════════════════ */

const BRAND_COLOR = "#059669";
const BRAND_COLOR_LIGHT = "#d1fae5";
const BRAND_DARK = "#047857";
const TEXT_COLOR = "#1f2937";
const MUTED_COLOR = "#6b7280";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nhaBeAgri.vn";
const ROLE_ICONS: Record<string, string> = {
  dealer: "🏪",
  supplier: "🏭",
};

/* ═══════════════════════════════════════════════════════════════════════════════
 * EMAIL COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export function InvitationEmail({
  invitedEmail,
  role,
  roleLabel,
  invitedBy,
  acceptUrl,
  expiresDays = 7,
}: InvitationEmailProps) {
  const roleIcon = ROLE_ICONS[role] || "👤";
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head />
      <Preview>
        Lời mời tham gia Nhà Bè Agri với vai trò {roleLabel}
      </Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Row>
              <Text style={styles.logo}>🌾 Nhà Bè Agri</Text>
            </Row>
            <Heading style={styles.headerTitle}>Bạn được mời tham gia</Heading>
            <Text style={styles.headerSubtitle}>
              Chào mừng bạn đến với hệ thống O2O Nhà Bè Agri
            </Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Greeting */}
          <Section style={styles.section}>
            <Text style={styles.greeting}>Xin chào,</Text>
            <Text style={styles.text}>
              Bạn nhận được lời mời từ{" "}
              <strong>{invitedBy}</strong> để tham gia hệ thống Nhà Bè Agri với vai trò{" "}
              <strong style={styles.roleHighlight}>
                {roleIcon} {roleLabel}
              </strong>
              .
            </Text>
            <Text style={styles.text}>
              Nhà Bè Agri là nền tảng O2O (Online-to-Offline) giúp kết nối nhà cung cấp vật tư
              nông nghiệp với khách hàng tiềm năng thông qua hệ thống tưới tiêu thông minh.
            </Text>
          </Section>

          {/* Role Benefits Card */}
          <Section style={styles.card}>
            <Heading style={styles.cardTitle}>
              {roleIcon} Vai trò {roleLabel}
            </Heading>

            {role === "dealer" ? (
              <ul style={styles.benefitsList}>
                <li style={styles.benefitItem}>
                  Nhận Lead tiềm năng từ khắp các tỉnh thành
                </li>
                <li style={styles.benefitItem}>
                  Công cụ dự toán BOM tự động theo cây trồng
                </li>
                <li style={styles.benefitItem}>
                  Dashboard quản lý và theo dõi trạng thái Lead
                </li>
                <li style={styles.benefitItem}>
                  Hỗ trợ kỹ thuật từ đội ngũ chuyên gia
                </li>
              </ul>
            ) : (
              <ul style={styles.benefitsList}>
                <li style={styles.benefitItem}>
                  Quản lý danh mục sản phẩm vật tư nông nghiệp
                </li>
                <li style={styles.benefitItem}>
                  Tiếp cận mạng lưới đại lý toàn quốc
                </li>
                <li style={styles.benefitItem}>
                  Công cụ Smart BOM phục vụ tư vấn kỹ thuật
                </li>
                <li style={styles.benefitItem}>
                  Báo cáo doanh số và thống kê chi tiết
                </li>
              </ul>
            )}
          </Section>

          {/* CTA Button */}
          <Section style={styles.ctaSection}>
            <Text style={styles.ctaText}>
              Nhấn nút bên dưới để chấp nhận lời mời và tạo tài khoản của bạn:
            </Text>
            <Button href={acceptUrl} style={styles.ctaButton}>
              Chấp Nhận Lời Mời &amp; Tạo Tài Khoản
            </Button>
            <Text style={styles.ctaNote}>
              Link này sẽ hết hạn sau <strong>{expiresDays} ngày</strong>.
            </Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Security Notice */}
          <Section style={styles.section}>
            <Heading style={styles.securityTitle}>🔒 Lưu ý bảo mật</Heading>
            <Text style={styles.securityText}>
              Nếu bạn không yêu cầu lời mời này, vui lòng bỏ qua email và không nhấn
              vào đường link. Tài khoản của bạn sẽ không bị ảnh hưởng.
            </Text>
            <Text style={styles.securityText}>
              Email được gửi đến: <strong>{invitedEmail}</strong>
            </Text>
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
              Truy cập Nhà Bè Agri
            </Link>
            <Text style={styles.footerMuted}>
              © {currentYear} Nhà Bè Agri. Hệ thống O2O quản lý vật tư nông nghiệp.
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
    fontWeight: "600",
    margin: "0 0 10px 0",
  },
  text: {
    fontSize: "15px",
    color: TEXT_COLOR,
    lineHeight: "1.6",
    margin: "0 0 15px 0",
  },
  roleHighlight: {
    color: BRAND_COLOR,
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
    margin: "0 0 15px 0",
  },
  benefitsList: {
    paddingLeft: "20px",
    margin: "0",
  },
  benefitItem: {
    fontSize: "14px",
    color: MUTED_COLOR,
    lineHeight: "1.8",
    margin: "0 0 8px 0",
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
  ctaNote: {
    fontSize: "12px",
    color: MUTED_COLOR,
    margin: "15px 0 0 0",
  },
  securityTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: TEXT_COLOR,
    margin: "0 0 10px 0",
  },
  securityText: {
    fontSize: "13px",
    color: MUTED_COLOR,
    lineHeight: "1.5",
    margin: "0 0 8px 0",
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
 * EXPORT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default InvitationEmail;
