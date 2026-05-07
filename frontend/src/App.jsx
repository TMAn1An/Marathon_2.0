import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import { AdminAuthProvider } from './context/AdminAuthContext'

import HomePage from './pages/HomePage'
import EventsPage from './pages/EventsPage'
import EventDetailPage from './pages/EventDetailPage'
import NewsPage from './pages/NewsPage'
import PostPage from './pages/PostPage'
import GalleryPage from './pages/GalleryPage'
import AboutPage from './pages/AboutPage'
import PaymentPage from './pages/PaymentPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import CertificatePage from './pages/CertificatePage'
import VerifyCertificatePage from './pages/VerifyCertificatePage'
import NotFoundPage from './pages/NotFoundPage'

import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminEventsPage from './pages/admin/AdminEventsPage'
import AdminParticipantsPage from './pages/admin/AdminParticipantsPage'
import AdminPostsPage from './pages/admin/AdminPostsPage'
import AdminPostEditPage from './pages/admin/AdminPostEditPage'
import AdminCertificatesPage from './pages/admin/AdminCertificatesPage'
import AdminAdminsPage from './pages/admin/AdminAdminsPage'
import AdminSponsorsPage from './pages/admin/AdminSponsorsPage'
import AdminVolunteersPage from './pages/admin/AdminVolunteersPage'

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:slug" element={<EventDetailPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:slug" element={<PostPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/payment/:participantId" element={<PaymentPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/certificate" element={<CertificatePage />} />
            <Route path="/verify/:uuid" element={<VerifyCertificatePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="events/:eventId/participants" element={<AdminParticipantsPage />} />
            <Route path="posts" element={<AdminPostsPage />} />
            <Route path="posts/new" element={<AdminPostEditPage />} />
            <Route path="posts/:id" element={<AdminPostEditPage />} />
            <Route path="certificates" element={<AdminCertificatesPage />} />
            <Route path="admins" element={<AdminAdminsPage />} />
            <Route path="sponsors" element={<AdminSponsorsPage />} />
            <Route path="volunteers" element={<AdminVolunteersPage />} />
          </Route>
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  )
}
