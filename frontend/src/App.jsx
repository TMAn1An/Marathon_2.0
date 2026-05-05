import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import { AdminAuthProvider } from './context/AdminAuthContext'

import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import RouteMapPage from './pages/RouteMapPage'
import RegistrationInfoPage from './pages/RegistrationInfoPage'
import FaqPage from './pages/FaqPage'
import SponsorsPage from './pages/SponsorsPage'
import OrganizersPage from './pages/OrganizersPage'
import RegisterPage from './pages/RegisterPage'
import PaymentPage from './pages/PaymentPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import CertificatePage from './pages/CertificatePage'
import VerifyCertificatePage from './pages/VerifyCertificatePage'
import ResultsPage from './pages/ResultsPage'
import NotFoundPage from './pages/NotFoundPage'

import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminParticipantsPage from './pages/admin/AdminParticipantsPage'
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage'
import AdminSponsorsPage from './pages/admin/AdminSponsorsPage'
import AdminVolunteersPage from './pages/admin/AdminVolunteersPage'

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/route" element={<RouteMapPage />} />
            <Route path="/registration-info" element={<RegistrationInfoPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/sponsors" element={<SponsorsPage />} />
            <Route path="/organizers" element={<OrganizersPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/certificate" element={<CertificatePage />} />
            <Route path="/verify/:uuid" element={<VerifyCertificatePage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="participants" element={<AdminParticipantsPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="sponsors" element={<AdminSponsorsPage />} />
            <Route path="volunteers" element={<AdminVolunteersPage />} />
          </Route>
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  )
}
