import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/admin/ProtectedRoute.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'
import AdminLoginPage from './pages/AdminLoginPage.jsx'
import AdminRegisterPage from './pages/AdminRegisterPage.jsx'
import HomePage from './pages/HomePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import PublicMenuPage from './pages/PublicMenuPage.jsx'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/carta/:slug" element={<PublicMenuPage />} />
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/register" element={<AdminRegisterPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
