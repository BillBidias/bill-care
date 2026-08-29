import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart";
import { ConsentProvider } from "@/lib/consent";
import ConsentBanner from "@/components/ConsentBanner";
import { AuthProvider } from "@/auth/AuthProvider";
import Index from "./pages/Index.tsx";
import ProgramsPage from "./pages/ProgramsPage.tsx";
import ProgramFinderPage from "./pages/ProgramFinderPage.tsx";
import AboutPage from "./pages/AboutPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import AccountPage from "./pages/AccountPage.tsx";
import PatientHomePage from "./pages/PatientHomePage.tsx";
import PatientSessionPlaceholderPage from "./pages/PatientSessionPlaceholderPage.tsx";
import CartPage from "./pages/CartPage.tsx";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage.tsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.tsx";
import ImpressumPage from "./pages/ImpressumPage.tsx";
import PrivacyPage from "./pages/PrivacyPage.tsx";
import TermsPage from "./pages/TermsPage.tsx";
import WithdrawalPage from "./pages/WithdrawalPage.tsx";
import CookiesPage from "./pages/CookiesPage.tsx";
import MedicalDisclaimerPage from "./pages/MedicalDisclaimerPage.tsx";
import RequireAuth from "@/auth/RequireAuth";
import RequireAdmin from "@/auth/RequireAdmin";

const queryClient = new QueryClient();

const PatientV2 = ({ children }: { children: React.ReactNode }) => (
  <div className="patient-v2">{children}</div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <ConsentProvider>
            <CartProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/finder" element={<ProgramFinderPage />} />
                  <Route path="/quiz" element={<ProgramFinderPage />} />
                  <Route path="/programs" element={<ProgramsPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/impressum" element={<ImpressumPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/withdrawal" element={<WithdrawalPage />} />
                  <Route path="/cookies" element={<CookiesPage />} />
                  <Route path="/medical-disclaimer" element={<MedicalDisclaimerPage />} />
                  <Route path="/checkout/success" element={<RequireAuth><CheckoutSuccessPage /></RequireAuth>} />
                  <Route path="/patient" element={<RequireAuth><PatientV2><PatientHomePage /></PatientV2></RequireAuth>} />
                  <Route path="/patient/session/:enrollmentId" element={<RequireAuth><PatientV2><PatientSessionPlaceholderPage /></PatientV2></RequireAuth>} />
                  <Route path="/account" element={<RequireAuth><PatientV2><AccountPage /></PatientV2></RequireAuth>} />
                  <Route path="/admin" element={<RequireAdmin><AdminDashboardPage /></RequireAdmin>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <ConsentBanner />
              </BrowserRouter>
            </CartProvider>
          </ConsentProvider>
        </AuthProvider>
      </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
