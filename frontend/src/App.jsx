import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { EventProvider } from './context/EventContext'
import ErrorBoundary from './components/ErrorBoundary'
import ScrollToTop from './components/ScrollToTop'
import Spinner from './components/Spinner'
import Page from './components/Page'

const HomePage = lazy(() => import('./pages/HomePage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const RouteMapPage = lazy(() => import('./pages/RouteMapPage'))
const RegistrationInfoPage = lazy(() => import('./pages/RegistrationInfoPage'))
const FaqPage = lazy(() => import('./pages/FaqPage'))
const SponsorsPage = lazy(() => import('./pages/SponsorsPage'))
const OrganizersPage = lazy(() => import('./pages/OrganizersPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const PaymentPage = lazy(() => import('./pages/PaymentPage'))
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'))
const CertificatePage = lazy(() => import('./pages/CertificatePage'))
const VerifyCertificatePage = lazy(() => import('./pages/VerifyCertificatePage'))
const ResultsPage = lazy(() => import('./pages/ResultsPage'))
const PayResumePage = lazy(() => import('./pages/PayResumePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const AdminParticipantsPage = lazy(() => import('./pages/admin/AdminParticipantsPage'))
const AdminPaymentsPage = lazy(() => import('./pages/admin/AdminPaymentsPage'))
const AdminResultsPage = lazy(() => import('./pages/admin/AdminResultsPage'))
const AdminNotificationsPage = lazy(() => import('./pages/admin/AdminNotificationsPage'))
const AdminSponsorsPage = lazy(() => import('./pages/admin/AdminSponsorsPage'))
const AdminVolunteersPage = lazy(() => import('./pages/admin/AdminVolunteersPage'))

const page = (title, el) => <Page title={title}>{el}</Page>

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <EventProvider>
          <AdminAuthProvider>
            <Suspense fallback={<Spinner />}>
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route path="/" element={page('', <HomePage />)} />
                  <Route path="/about" element={page('About', <AboutPage />)} />
                  <Route path="/route" element={page('Route map', <RouteMapPage />)} />
                  <Route path="/registration-info" element={page('Registration info', <RegistrationInfoPage />)} />
                  <Route path="/faq" element={page('FAQ', <FaqPage />)} />
                  <Route path="/sponsors" element={page('Sponsors', <SponsorsPage />)} />
                  <Route path="/organizers" element={page('Organizers', <OrganizersPage />)} />
                  <Route path="/register" element={page('Register', <RegisterPage />)} />
                  <Route path="/pay/:token" element={page('Resume payment', <PayResumePage />)} />
                  <Route path="/payment" element={page('Payment', <PaymentPage />)} />
                  <Route path="/payment/success" element={page('Registration status', <PaymentSuccessPage />)} />
                  <Route path="/certificate" element={page('Certificate', <CertificatePage />)} />
                  <Route path="/verify/:uuid" element={page('Verify certificate', <VerifyCertificatePage />)} />
                  <Route path="/results" element={page('Results', <ResultsPage />)} />
                  <Route path="*" element={page('Page not found', <NotFoundPage />)} />
                </Route>

                <Route path="/admin/login" element={page('Admin sign in', <AdminLoginPage />)} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={page('Dashboard', <AdminDashboardPage />)} />
                  <Route path="participants" element={page('Participants', <AdminParticipantsPage />)} />
                  <Route path="payments" element={page('Payments', <AdminPaymentsPage />)} />
                  <Route path="results" element={page('Results', <AdminResultsPage />)} />
                  <Route path="notifications" element={page('Notifications', <AdminNotificationsPage />)} />
                  <Route path="sponsors" element={page('Sponsors', <AdminSponsorsPage />)} />
                  <Route path="volunteers" element={page('Volunteers', <AdminVolunteersPage />)} />
                </Route>
              </Routes>
            </Suspense>
          </AdminAuthProvider>
        </EventProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
