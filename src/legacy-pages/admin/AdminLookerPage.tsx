import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, Copy, ExternalLink, Save, Database, FileCode2 } from 'lucide-react';

const LOOKER_KEY = 'looker_studio_embed_url';

const BQ_SCHEMA_SQL = `-- ===========================================================
-- AgriFlow / Nhà Bè Agri — BigQuery Schema for Looker Studio
-- Dataset: nhabe_agri_bi  (region: asia-southeast1 khuyến nghị)
-- ===========================================================

CREATE SCHEMA IF NOT EXISTS \`<PROJECT_ID>.nhabe_agri_bi\`
OPTIONS(location = "asia-southeast1");

-- 1. Tracking events (page_view, product_view, call_click, zalo_click, inquiry_submit, calculator_*)
CREATE TABLE IF NOT EXISTS \`<PROJECT_ID>.nhabe_agri_bi.tracking_events\` (
  id              STRING NOT NULL,
  event_id        STRING NOT NULL,
  event_name      STRING NOT NULL,
  url             STRING,
  referrer        STRING,
  user_id         STRING,
  session_id      STRING,
  ip_address      STRING,
  user_agent      STRING,
  fb_status       STRING,
  tiktok_status   STRING,
  payload         JSON,
  created_at      TIMESTAMP NOT NULL
)
PARTITION BY DATE(created_at)
CLUSTER BY event_name, session_id;

-- 2. Calculator leads (ROI / dimensioning leads)
CREATE TABLE IF NOT EXISTS \`<PROJECT_ID>.nhabe_agri_bi.calculator_leads\` (
  id                 STRING NOT NULL,
  customer_name      STRING NOT NULL,
  customer_phone     STRING NOT NULL,
  customer_province  STRING,
  crop               STRING NOT NULL,
  area_m2            NUMERIC NOT NULL,
  water_source       STRING,
  slope              STRING,
  spacing            STRING,
  pump_hp            NUMERIC,
  pipe_meters        NUMERIC,
  nozzle_count       INT64,
  total_cost         NUMERIC,
  status             STRING,
  dealer_id          STRING,
  notes              STRING,
  created_at         TIMESTAMP NOT NULL
)
PARTITION BY DATE(created_at)
CLUSTER BY status, customer_province, crop;

-- 3. Market prices (giá nông sản theo tỉnh)
CREATE TABLE IF NOT EXISTS \`<PROJECT_ID>.nhabe_agri_bi.market_prices\` (
  id           STRING NOT NULL,
  crop_key     STRING NOT NULL,
  crop_label   STRING,
  province     STRING NOT NULL,
  price_vnd    NUMERIC NOT NULL,
  unit         STRING,
  source       STRING,
  recorded_at  TIMESTAMP NOT NULL
)
PARTITION BY DATE(recorded_at)
CLUSTER BY crop_key, province;

-- ===========================================================
-- VIEWS dùng cho Looker Studio (Marketing BI Dashboard)
-- ===========================================================

-- V1. Conversion Funnel theo ngày
CREATE OR REPLACE VIEW \`<PROJECT_ID>.nhabe_agri_bi.v_funnel_daily\` AS
SELECT
  DATE(created_at) AS day,
  COUNTIF(event_name = 'page_view')              AS visits,
  COUNTIF(event_name = 'product_view')           AS product_views,
  COUNTIF(event_name = 'calculator_used')        AS calc_used,
  COUNTIF(event_name = 'calculator_lead_submit') AS calc_leads,
  COUNTIF(event_name IN ('call_click','zalo_click')) AS cta_clicks
FROM \`<PROJECT_ID>.nhabe_agri_bi.tracking_events\`
GROUP BY day;

-- V2. CAPI breakdown theo ad source (đọc từ payload.ad_source)
CREATE OR REPLACE VIEW \`<PROJECT_ID>.nhabe_agri_bi.v_capi_by_source\` AS
SELECT
  DATE(created_at) AS day,
  COALESCE(JSON_VALUE(payload, '$.ad_source'), 'direct') AS ad_source,
  COUNTIF(event_name = 'page_view')   AS page_views,
  COUNTIF(event_name = 'call_click')  AS call_clicks,
  COUNTIF(event_name = 'zalo_click')  AS zalo_clicks,
  COUNTIF(event_name = 'inquiry_submit') AS inquiries
FROM \`<PROJECT_ID>.nhabe_agri_bi.tracking_events\`
GROUP BY day, ad_source;

-- V3. Calculator leads theo tỉnh + crop
CREATE OR REPLACE VIEW \`<PROJECT_ID>.nhabe_agri_bi.v_calc_leads_by_geo\` AS
SELECT
  DATE(created_at) AS day,
  customer_province,
  crop,
  COUNT(*)        AS lead_count,
  AVG(total_cost) AS avg_cost,
  SUM(total_cost) AS pipeline_vnd
FROM \`<PROJECT_ID>.nhabe_agri_bi.calculator_leads\`
GROUP BY day, customer_province, crop;

-- V4. Giá thị trường mới nhất theo (crop, province)
CREATE OR REPLACE VIEW \`<PROJECT_ID>.nhabe_agri_bi.v_latest_prices\` AS
SELECT * EXCEPT(rn) FROM (
  SELECT
    *,
    ROW_NUMBER() OVER (PARTITION BY crop_key, province ORDER BY recorded_at DESC) AS rn
  FROM \`<PROJECT_ID>.nhabe_agri_bi.market_prices\`
) WHERE rn = 1;

-- ===========================================================
-- HƯỚNG DẪN NẠP DỮ LIỆU
-- ===========================================================
-- 1. Vào /admin/integrations → bấm "BI Export" để gọi edge function bi-export
--    Output JSON gồm 3 mảng: tracking_events / calculator_leads / market_prices
-- 2. Có thể schedule cron (n8n / Cloud Scheduler) gọi edge function mỗi giờ,
--    upload kết quả lên GCS rồi LOAD vào BigQuery, hoặc stream insert trực tiếp.
-- 3. Trong Looker Studio: Add Data → BigQuery → chọn các view v_*
--    để dựng dashboard Funnel / CAPI / Geo / Price Trend.
`;

export default function AdminLookerPage() {
  const [embedUrl, setEmbedUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', LOOKER_KEY)
        .maybeSingle();
      const url = (data?.value as { url?: string } | null)?.url ?? '';
      setEmbedUrl(url);
      setSavedUrl(url);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: LOOKER_KEY, value: { url: embedUrl }, description: 'Looker Studio embed URL' });
    setSaving(false);
    if (error) {
      toast({ title: 'Lỗi lưu', description: error.message, variant: 'destructive' });
      return;
    }
    setSavedUrl(embedUrl);
    toast({ title: 'Đã lưu', description: 'URL Looker Studio cập nhật thành công.' });
  };

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: 'Đã copy', description: label });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" /> Looker Studio Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Nhúng dashboard Looker + sao chép SQL schema BigQuery cho team BI tự dựng nhanh.
          </p>
        </div>
        <Badge variant="secondary">BI Workspace</Badge>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ExternalLink className="w-4 h-4" /> Cấu hình Embed URL
          </CardTitle>
          <CardDescription>
            Vào Looker Studio → File → Embed report → bật "Enable embedding" → copy URL dạng
            <code className="mx-1 px-1 rounded bg-muted text-xs">https://lookerstudio.google.com/embed/reporting/&lt;ID&gt;/page/&lt;PAGE&gt;</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="looker-url">Looker Studio Embed URL</Label>
            <div className="flex gap-2">
              <Input
                id="looker-url"
                placeholder="https://lookerstudio.google.com/embed/reporting/..."
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                disabled={loading}
              />
              <Button onClick={save} disabled={saving || loading || embedUrl === savedUrl}>
                <Save className="w-4 h-4" /> Lưu
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard"><BarChart3 className="w-4 h-4 mr-1" />Dashboard</TabsTrigger>
          <TabsTrigger value="schema"><Database className="w-4 h-4 mr-1" />BigQuery Schema</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {savedUrl ? (
                <div className="aspect-video w-full bg-muted">
                  <iframe
                    title="Looker Studio Report"
                    src={savedUrl}
                    className="w-full h-full border-0 rounded-md"
                    allowFullScreen
                    sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                  />
                </div>
              ) : (
                <div className="p-12 text-center text-sm text-muted-foreground">
                  <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  Chưa cấu hình URL. Nhập Embed URL phía trên rồi bấm Lưu để hiển thị dashboard.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schema" className="mt-4 space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileCode2 className="w-4 h-4" /> BigQuery DDL + Views cho Looker Studio
              </CardTitle>
              <CardDescription>
                Thay <code className="px-1 rounded bg-muted text-xs">&lt;PROJECT_ID&gt;</code> bằng project GCP của bạn.
                Các bảng được partition theo ngày + cluster để tối ưu chi phí query.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => copy(BQ_SCHEMA_SQL, 'Toàn bộ SQL schema đã copy vào clipboard')}>
                  <Copy className="w-4 h-4" /> Copy toàn bộ SQL
                </Button>
                <Button
                  variant="outline"
                  onClick={() => copy(
                    BQ_SCHEMA_SQL.split('-- ===========================================================')[1] ?? '',
                    'Phần CREATE TABLE đã copy',
                  )}
                >
                  <Copy className="w-4 h-4" /> Chỉ CREATE TABLE
                </Button>
                <Button asChild variant="ghost">
                  <a href="https://console.cloud.google.com/bigquery" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" /> Mở BigQuery Console
                  </a>
                </Button>
              </div>
              <Textarea
                readOnly
                value={BQ_SCHEMA_SQL}
                className="font-mono text-xs h-[480px] bg-muted/40"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
