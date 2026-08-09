import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import RequireAuth from './components/RequireAuth';
import RequireAdmin from './components/RequireAdmin';
import RequireMasterAdmin from './components/RequireMasterAdmin';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AdminLoginPage from './pages/AdminLoginPage';
import CitizenPage from './pages/CitizenPage';
import AuthorityPage from './pages/AuthorityPage';
import SocialPage from './pages/SocialPage';
import MasterAdminPage from './pages/MasterAdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen w-full bg-ink text-white selection:bg-orange-500/30">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />
            <Route
              path="/citizen"
              element={
                <RequireAuth>
                  <CitizenPage />
                </RequireAuth>
              }
            />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/authority"
              element={
                <RequireAdmin>
                  <AuthorityPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/social"
              element={
                <RequireAdmin>
                  <SocialPage />
                </RequireAdmin>
              }
            />
            <Route
              path="/master-admin"
              element={
                <RequireMasterAdmin>
                  <MasterAdminPage />
                </RequireMasterAdmin>
              }
            />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
