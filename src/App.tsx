import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { HomepageConfigProvider } from "@/contexts/HomepageConfigContext";
import { ControlCenterProvider } from "@/contexts/ControlCenterContext";
import AdminHomepagePage from "@/legacy-pages/admin/AdminHomepagePage";
import AdminControlPage from "@/legacy-pages/admin/AdminControlPage";
import { captureAttribution } from "@/lib/tracking";
import { initGA4 } from "@/lib/ga4Client";
import GA4RouteTracker from "@/components/GA4RouteTracker";
import PublicLayout from "@/layouts/PublicLayout";
import AdminLayout from "@/layouts/AdminLayout";
import DealerLayout from "@/layouts/DealerLayout";
import PartnerLayout from "@/layouts/PartnerLayout";
import AuthPage from "@/legacy-pages/AuthPage";
import CustomerHomePage from "@/legacy-pages/customer/HomePage";
import ProductsPage from "@/legacy-pages/customer/ProductsPage";
import ProductCatalogPage from "@/legacy-pages/customer/ProductCatalogPage";
import ProductDetailPage from "@/legacy-pages/customer/ProductDetailPage";
import AiDoctorPage from "@/legacy-pages/customer/AiDoctorPage";
import FertigationPage from "@/legacy-pages/customer/FertigationPage";
import DealersPage from "@/legacy-pages/customer/DealersPage";
import CartPage from "@/legacy-pages/customer/CartPage";
import CustomerOrdersPage from "@/legacy-pages/customer/OrdersPage";
import DealerDashboard from "@/legacy-pages/dealer/DealerDashboard";
import DealerProductsPage from "@/legacy-pages/dealer/DealerProductsPage";
import DealerInventoryPage from "@/legacy-pages/dealer/DealerInventoryPage";
import DealerOrdersPage from "@/legacy-pages/dealer/DealerOrdersPage";
import DealerLeadsPage from "@/legacy-pages/dealer/DealerLeadsPage";
import PublicStorefrontPage from "@/legacy-pages/dealer/PublicStorefrontPage";
import AdminDashboard from "@/legacy-pages/admin/AdminDashboard";
import AdminDealersPage from "@/legacy-pages/admin/AdminDealersPage";
import AdminProductsPage from "@/legacy-pages/admin/AdminProductsPage";
import AdminConfigPage from "@/legacy-pages/admin/AdminConfigPage";
import AdminLeadsPage from "@/legacy-pages/admin/AdminLeadsPage";
import AdminApprovalsPage from "@/legacy-pages/admin/AdminApprovalsPage";
import AdminCommissionPage from "@/legacy-pages/admin/AdminCommissionPage";
import AdminHeatmapPage from "@/legacy-pages/admin/AdminHeatmapPage";
import FieldSalesDashboard from "@/legacy-pages/fieldsales/FieldSalesDashboard";
import QuickOrderPage from "@/legacy-pages/fieldsales/QuickOrderPage";
import FieldSalesCustomersPage from "@/legacy-pages/fieldsales/FieldSalesCustomersPage";
import MarketPage from "@/legacy-pages/market/MarketPage";
import NewsPage from "@/legacy-pages/news/NewsPage";

import SolutionsPage from "@/legacy-pages/solutions/SolutionsPage";
import ContactPage from "@/legacy-pages/contact/ContactPage";
import CalculatorPage from "@/legacy-pages/tools/CalculatorPage";
import CalculatorWizardPage from "@/legacy-pages/tools/CalculatorWizardPage";
import HydraulicCalculatorPage from "@/legacy-pages/tools/HydraulicCalculatorPage";
import CalculatorHubPage from "@/legacy-pages/tools/CalculatorHubPage";
import IrrigationPlanner from "@/legacy-pages/tools/IrrigationPlanner";
import NutrientExpert from "@/legacy-pages/tools/NutrientExpert";
import AiDoctorExpert from "@/legacy-pages/tools/AiDoctorExpert";
import HeadLossPage from "@/legacy-pages/tools/HeadLossPage";
import BomEstimatorPage from "@/legacy-pages/tools/BomEstimatorPage";
import ElectricalCalculatorPage from "@/legacy-pages/tools/ElectricalCalculatorPage";
import RoiCalculatorPage from "@/legacy-pages/tools/RoiCalculatorPage";
import AdminCalculatorParamsPage from "@/legacy-pages/admin/AdminCalculatorParamsPage";
import AdminCalculatorLeadsPage from "@/legacy-pages/admin/AdminCalculatorLeadsPage";
import PartnerDashboard from "@/legacy-pages/partner/PartnerDashboard";
import InstallerRegisterPage from "@/legacy-pages/installers/InstallerRegisterPage";
import InstallerPortalPage from "@/legacy-pages/installers/InstallerPortalPage";
import AdminInstallersPage from "@/legacy-pages/admin/AdminInstallersPage";
import AdminAIRulesPage from "@/legacy-pages/admin/AdminAIRulesPage";
import AdminMarketingBIPage from "@/legacy-pages/admin/AdminMarketingBIPage";
import AdminLookerPage from "@/legacy-pages/admin/AdminLookerPage";
import AdminIntegrationsPage from "@/legacy-pages/admin/AdminIntegrationsPage";
import AdminStaffPage from "@/legacy-pages/admin/AdminStaffPage";
import AdminTrackingLogsPage from "@/legacy-pages/admin/AdminTrackingLogsPage";
import AdminNervousSystemPage from "@/legacy-pages/admin/AdminNervousSystemPage";
import AIRulePopup from "@/components/AIRulePopup";
import SeoLandingPage from "@/legacy-pages/seo/SeoLandingPage";
import SeoLandingIndex from "@/legacy-pages/seo/SeoLandingIndex";
import AdminCmsPage from "@/legacy-pages/admin/AdminCmsPage";
import AdminCaseStudiesPage from "@/legacy-pages/admin/AdminCaseStudiesPage";
import LibraryPage from "@/legacy-pages/library/LibraryPage";
import ArticleDetailPage from "@/legacy-pages/library/ArticleDetailPage";
import CaseStudiesPage from "@/legacy-pages/casestudies/CaseStudiesPage";
import CaseStudyDetailPage from "@/legacy-pages/casestudies/CaseStudyDetailPage";
import KnowledgeHubPage from "@/legacy-pages/customer/KnowledgeHubPage";
import NotFound from "./legacy-pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => { captureAttribution(); initGA4(); }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <AppProvider>
            <HomepageConfigProvider>
            <ControlCenterProvider>
            <BrowserRouter>
              <GA4RouteTracker />
              <AIRulePopup />
              <Routes>
                {/* Auth — standalone, no nav */}
                <Route path="/auth" element={<AuthPage />} />

                {/* Public + Customer — TopNav layout */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<CustomerHomePage />} />
                  <Route path="/san-pham" element={<ProductCatalogPage />} />
                  <Route path="/san-pham/:slug" element={<ProductDetailPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/orders" element={<CustomerOrdersPage />} />
                  <Route path="/cong-cu/du-toan-thuy-luc" element={<IrrigationPlanner />} />
                  <Route path="/cong-cu/chuyen-gia-dinh-duong" element={<NutrientExpert />} />
                  <Route path="/cong-cu/bac-si-ai-expert" element={<AiDoctorExpert />} />
                  <Route path="/thi-truong" element={<MarketPage />} />
                  <Route path="/tin-tuc" element={<NewsPage />} />
                  <Route path="/dai-ly" element={<DealersPage />} />
                  <Route path="/giai-phap" element={<SolutionsPage />} />
                  <Route path="/lien-he" element={<ContactPage />} />
                  <Route path="/cong-cu" element={<CalculatorHubPage />} />
                  <Route path="/cong-cu/tinh-toan" element={<CalculatorWizardPage />} />
                  <Route path="/cong-cu/cham-phan" element={<FertigationPage />} />
                  <Route path="/cong-cu/bac-si-ai" element={<AiDoctorPage />} />
                  <Route path="/cong-cu/tinh-toan-tuoi" element={<CalculatorPage />} />
                  <Route path="/cong-cu/tinh-toan-thuy-luc" element={<HydraulicCalculatorPage />} />
                  <Route path="/cong-cu/sut-ap" element={<HeadLossPage />} />
                  <Route path="/cong-cu/du-toan-1ha" element={<BomEstimatorPage />} />
                  <Route path="/cong-cu/dien-nang" element={<ElectricalCalculatorPage />} />
                  <Route path="/cong-cu/roi" element={<RoiCalculatorPage />} />
                  <Route path="/giai-phap-tuoi" element={<SeoLandingIndex />} />
                  <Route path="/giai-phap-tuoi/:crop/:province" element={<SeoLandingPage />} />
                  <Route path="/doi-tho/dang-ky" element={<InstallerRegisterPage />} />
                  <Route path="/doi-tho" element={<InstallerPortalPage />} />
                  <Route path="/diem-ban/:slug" element={<PublicStorefrontPage />} />
                  {/* Field Sales — keep on TopNav */}
                  <Route path="/fieldsales" element={<FieldSalesDashboard />} />
                  <Route path="/fieldsales/quick-order" element={<QuickOrderPage />} />
                  <Route path="/fieldsales/customers" element={<FieldSalesCustomersPage />} />
                  {/* CMS public surface */}
                  <Route path="/thu-vien" element={<LibraryPage />} />
                  <Route path="/thu-vien/:slug" element={<ArticleDetailPage />} />
                  <Route path="/case-studies" element={<CaseStudiesPage />} />
                  <Route path="/case-studies/:slug" element={<CaseStudyDetailPage />} />
                  <Route path="/blog" element={<KnowledgeHubPage />} />
                </Route>

                {/* Admin — sidebar + RBAC */}
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/control" element={<AdminControlPage />} />
                  <Route path="/admin/dealers" element={<AdminDealersPage />} />
                  <Route path="/admin/products" element={<AdminProductsPage />} />
                  <Route path="/admin/config" element={<AdminConfigPage />} />
                  <Route path="/admin/leads" element={<AdminLeadsPage />} />
                  <Route path="/admin/approvals" element={<AdminApprovalsPage />} />
                  <Route path="/admin/commission" element={<AdminCommissionPage />} />
                  <Route path="/admin/heatmap" element={<AdminHeatmapPage />} />
                  <Route path="/admin/installers" element={<AdminInstallersPage />} />
                  <Route path="/admin/ai-rules" element={<AdminAIRulesPage />} />
                  <Route path="/admin/marketing-bi" element={<AdminMarketingBIPage />} />
                  <Route path="/admin/marketing-bi/looker" element={<AdminLookerPage />} />
                  <Route path="/admin/homepage" element={<AdminHomepagePage />} />
                  <Route path="/admin/settings/calculator" element={<AdminCalculatorParamsPage />} />
                  <Route path="/admin/leads/calculator" element={<AdminCalculatorLeadsPage />} />
                  <Route path="/admin/integrations" element={<AdminIntegrationsPage />} />
                  <Route path="/admin/staff" element={<AdminStaffPage />} />
                  <Route path="/admin/tracking-logs" element={<AdminTrackingLogsPage />} />
                  <Route path="/admin/nervous-system" element={<AdminNervousSystemPage />} />
                  <Route path="/admin/cms" element={<AdminCmsPage />} />
                  <Route path="/admin/case-studies" element={<AdminCaseStudiesPage />} />
                </Route>

                {/* Dealer — sidebar + RBAC */}
                <Route element={<DealerLayout />}>
                  <Route path="/dealer" element={<DealerDashboard />} />
                  <Route path="/dealer/products" element={<DealerProductsPage />} />
                  <Route path="/dealer/inventory" element={<DealerInventoryPage />} />
                  <Route path="/dealer/orders" element={<DealerOrdersPage />} />
                  <Route path="/dealer/leads" element={<DealerLeadsPage />} />
                </Route>

                {/* Partner (Dealer + Technician) */}
                <Route element={<PartnerLayout />}>
                  <Route path="/partner/dashboard" element={<PartnerDashboard />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            </ControlCenterProvider>
            </HomepageConfigProvider>
          </AppProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
