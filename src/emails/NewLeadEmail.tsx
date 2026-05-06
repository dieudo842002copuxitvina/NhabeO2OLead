/**
 * ╔═══════════════════════════════════════════════════════════════════════════════╗
 * ║  NEW LEAD EMAIL TEMPLATE                                        ║
 * ║  React Email template for notifying dealers about new leads               ║
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
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface NewLeadEmailProps {
  dealerName: string;
  customerName?: string;
  customerPhone: string;
  province?: string;
  district?: string;
  cropType?: string;
  areaHa?: number;
  leadId: string;
  dashboardUrl: string;
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * EMAIL TEMPLATE STYLES
 * ═══════════════════════════════════════════════════════════════════════════════ */

const styles = {
  container: {
    backgroundColor: "#f8fafc",
    fontFamily: "sans-serif",
    padding: "20px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    padding: "32px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  header: {
    background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    borderRadius: "8px 8px 0 0",
    padding: "24px",
    textAlign: "center" as const,
    margin: "-32px -32px 32px -32px",
  },
  heading: {
    color: "#ffffff",
    fontSize: "24px",
    fontWeight: "bold" as const,
    margin: "0 0 8px 0",
  },
  subheading: {
    color: "#d1fae5",
    fontSize: "14px",
    margin: "0",
  },
  section: {
    marginBottom: "24px",
  },
  label: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },
  value: {
    color: "#1e293b",
    fontSize: "16px",
    fontWeight: "500" as const,
    margin: "0",
  },
  highlightBox: {
    backgroundColor: "#fef3c7",
    border: "1px solid #f59e0b",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "24px",
  },
  ctaButton: {
    backgroundColor: "#059669",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600" as const,
    padding: "14px 28px",
    display: "inline-block",
    textDecoration: "none",
  },
  footer: {
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #e2e8f0",
    textAlign: "center" as const,
  },
  footerText: {
    color: "#64748b",
    fontSize: "12px",
    margin: "0 0 8px 0",
  },
  badge: {
    display: "inline-block",
    backgroundColor: "#d1fae5",
    color: "#065f46",
    padding: "4px 12px",
    borderRadius: "9999px",
    fontSize: "12px",
    fontWeight: "600" as const,
  },
};

/* ═══════════════════════════════════════════════════════════════════════════════
 * COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════ */

export function NewLeadEmail({
  dealerName,
  customerName,
  customerPhone,
  province,
  district,
  cropType,
  areaHa,
  leadId,
  dashboardUrl,
}: NewLeadEmailProps) {
  const fullAddress = [district, province].filter(Boolean).join(", ");

  return (
    <Html>
      <Head />
      <Preview>
        🔔 Lead mới từ Nhà Bè Agri - Khách hàng {customerName || "nông dân"} cần tư vấn
      </Preview>
      <Body style={styles.container}>
        <Container style={styles.card}>
          {/* Header */}
          <div style={styles.header}>
            <Heading style={styles.heading}>🔔 Lead Mới</Heading>
            <Text style={styles.subheading}>
              Có khách hàng mới cần được tư vấn từ Nhà Bè Agri
            </Text>
          </div>

          {/* Greeting */}
          <Section style={styles.section}>
            <Text style={{ ...styles.value, marginBottom: "16px" }}>
              Xin chào <strong>{dealerName}</strong>,
            </Text>
            <Text style={{ ...styles.value, color: "#475569", lineHeight: "1.6" }}>
              Bạn vừa nhận được một Lead mới từ hệ thống Nhà Bè Agri. 
              Vui lòng liên hệ khách hàng trong thời gian sớm nhất để tư vấn và hỗ trợ.
            </Text>
          </Section>

          {/* Customer Info */}
          <Section style={styles.section}>
            <Heading 
              style={{ 
                fontSize: "14px", 
                fontWeight: "600", 
                color: "#1e293b", 
                marginBottom: "16px",
                borderBottom: "2px solid #059669",
                paddingBottom: "8px",
                display: "inline-block",
              }}
            >
              📋 Thông Tin Khách Hàng
            </Heading>

            <div style={{ display: "grid", gap: "16px" }}>
              {/* Customer Name */}
              <div>
                <Text style={styles.label}>Tên khách hàng</Text>
                <Text style={styles.value}>
                  {customerName || "Khách hàng ẩn danh"}
                  {customerName && (
                    <span style={{ marginLeft: "8px", fontSize: "12px" }}>
                      <span style={styles.badge}>Khách hàng tiềm năng</span>
                    </span>
                  )}
                </Text>
              </div>

              {/* Phone - Highlighted */}
              <div style={styles.highlightBox}>
                <Text style={{ ...styles.label, color: "#92400e", marginBottom: "4px" }}>
                  📞 Số điện thoại
                </Text>
                <Text style={{ ...styles.value, fontSize: "20px", fontWeight: "bold", color: "#1e293b" }}>
                  <a href={`tel:${customerPhone}`} style={{ color: "#059669", textDecoration: "none" }}>
                    {customerPhone}
                  </a>
                </Text>
              </div>

              {/* Location */}
              {fullAddress && (
                <div>
                  <Text style={styles.label}>📍 Khu vực</Text>
                  <Text style={styles.value}>{fullAddress}</Text>
                </div>
              )}

              {/* Crop Type */}
              {cropType && (
                <div>
                  <Text style={styles.label}>🌱 Loại cây trồng</Text>
                  <Text style={styles.value}>{cropType}</Text>
                </div>
              )}

              {/* Area */}
              {areaHa && (
                <div>
                  <Text style={styles.label}>📐 Diện tích</Text>
                  <Text style={styles.value}>{areaHa.toLocaleString("vi-VN")} ha</Text>
                </div>
              )}
            </div>
          </Section>

          {/* CTA Button */}
          <Section style={{ ...styles.section, textAlign: "center" as const }}>
            <Button 
              href={dashboardUrl} 
              style={styles.ctaButton}
            >
              📊 Xem Chi Tiết & Dự Toán Vật Tư (BOM)
            </Button>
          </Section>

          {/* Note */}
          <Section style={styles.section}>
            <Text style={{ ...styles.value, fontSize: "13px", color: "#64748b", fontStyle: "italic" }}>
              💡 <strong>Lưu ý:</strong> Sau khi liên hệ khách hàng, bạn có thể cập nhật 
              trạng thái Lead (Đã liên hệ, Đang xử lý, Thành công, Thất bại) tại trang Dashboard.
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={{ borderColor: "#e2e8f0", margin: "24px 0" }} />
          <div style={styles.footer}>
            <Text style={styles.footerText}>
              <strong>Nhà Bè Agri</strong> - Hệ thống tưới tiêu thông minh
            </Text>
            <Text style={styles.footerText}>
              📞 Hotline: 1900 1234 | 🌐 www.nhabe-agri.com
            </Text>
            <Text style={{ ...styles.footerText, marginTop: "16px", fontSize: "10px", color: "#94a3b8" }}>
              Email này được gửi tự động từ hệ thống Nhà Bè Agri. 
              Vui lòng không trả lời trực tiếp email này.
            </Text>
            <Text style={{ ...styles.footerText, fontSize: "10px", color: "#94a3b8" }}>
              Lead ID: {leadId.slice(0, 8)}...
            </Text>
          </div>
        </Container>
      </Body>
    </Html>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
 * EXPORT PROPS FOR TYPE SAFETY
 * ═══════════════════════════════════════════════════════════════════════════════ */

export default NewLeadEmail;

export type NewLeadEmailPropsType = NewLeadEmailProps;
