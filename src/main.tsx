import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/providers/AuthProvider';
import { AuthModalProvider } from './auth/providers/AuthModalProvider';
import { SubscriptionProvider } from './subscriptions/providers/SubscriptionProvider';
import { PublicRoute } from './auth/middleware/PublicRoute';
import { LoginPage } from './auth/pages/LoginPage';
import { RegisterPage } from './auth/pages/RegisterPage';
import { ForgotPasswordPage } from './auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from './auth/pages/ResetPasswordPage';
import { PricingPage } from './subscriptions/pages/PricingPage';
import { BillingPage } from './subscriptions/pages/BillingPage';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AuthModalProvider>
          <SubscriptionProvider>
            <Routes>
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
              <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/" element={<App />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SubscriptionProvider>
        </AuthModalProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
