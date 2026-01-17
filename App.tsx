
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { User, Screen } from './types.ts';
import { ROUTES } from './constants.tsx';

// Import Screens with explicit extensions for browser-native ESM support
import LandingScreen from './screens/LandingScreen.tsx';
import SignInScreen from './screens/SignInScreen.tsx';
import SignUpScreen from './screens/SignUpScreen.tsx';
import DashboardScreen from './screens/DashboardScreen.tsx';
import OnboardingScreen from './screens/OnboardingScreen.tsx';
import JDSetupScreen from './screens/JDSetupScreen.tsx';
import InterviewScreen from './screens/InterviewScreen.tsx';
import AnalysisScreen from './screens/AnalysisScreen.tsx';
import SettingsScreen from './screens/SettingsScreen.tsx';
import SubscriptionScreen from './screens/SubscriptionScreen.tsx';
import CVLandingScreen from './screens/CVLandingScreen.tsx';
import CVAnalysisScreen from './screens/CVAnalysisScreen.tsx';
import CVEditorScreen from './screens/CVEditorScreen.tsx';
import PrivacyScreen from './screens/PrivacyScreen.tsx';
import TermsScreen from './screens/TermsScreen.tsx';
import ContactScreen from './screens/ContactScreen.tsx';

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('mock_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.email) {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load user from storage", e);
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('mock_user', JSON.stringify(u));
    navigate(ROUTES.DASHBOARD);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mock_user');
    navigate(ROUTES.LANDING);
  };

  const handleNavigate = (target: Screen) => {
    const routeMap: Record<Screen, string> = {
      [Screen.Landing]: ROUTES.LANDING,
      [Screen.SignIn]: ROUTES.SIGN_IN,
      [Screen.SignUp]: ROUTES.SIGN_UP,
      [Screen.Dashboard]: ROUTES.DASHBOARD,
      [Screen.Onboarding]: ROUTES.ONBOARDING,
      [Screen.JDSetup]: ROUTES.JD_SETUP,
      [Screen.Interview]: ROUTES.INTERVIEW,
      [Screen.Analysis]: ROUTES.ANALYSIS,
      [Screen.Settings]: ROUTES.SETTINGS,
      [Screen.Subscription]: ROUTES.SUBSCRIPTION,
      [Screen.CVLanding]: ROUTES.CV_LANDING,
      [Screen.CVAnalysis]: ROUTES.CV_ANALYSIS,
      [Screen.CVEditor]: ROUTES.CV_EDITOR,
      [Screen.Privacy]: ROUTES.PRIVACY,
      [Screen.Terms]: ROUTES.TERMS,
      [Screen.Contact]: ROUTES.CONTACT,
      [Screen.ForgotPassword]: ROUTES.SIGN_IN,
    };
    const path = routeMap[target] || ROUTES.LANDING;
    navigate(path);
  };

  const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
    if (!user) return <Navigate to={ROUTES.SIGN_IN} replace />;
    return children;
  };

  return (
    <div className="min-h-screen bg-[#0f111a] text-white">
      <Routes>
        <Route path={ROUTES.LANDING} element={<LandingScreen onNavigate={handleNavigate} />} />
        <Route path={ROUTES.SIGN_IN} element={<SignInScreen onNavigate={handleNavigate} onLogin={handleLogin} />} />
        <Route path={ROUTES.SIGN_UP} element={<SignUpScreen onNavigate={handleNavigate} onLogin={handleLogin} />} />
        <Route path={ROUTES.PRIVACY} element={<PrivacyScreen onNavigate={handleNavigate} />} />
        <Route path={ROUTES.TERMS} element={<TermsScreen onNavigate={handleNavigate} />} />
        <Route path={ROUTES.CONTACT} element={<ContactScreen onNavigate={handleNavigate} />} />

        <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><DashboardScreen user={user} onNavigate={handleNavigate} onLogout={handleLogout} /></ProtectedRoute>} />
        <Route path={ROUTES.ONBOARDING} element={<ProtectedRoute><OnboardingScreen user={user} onNavigate={handleNavigate} /></ProtectedRoute>} />
        <Route path={ROUTES.JD_SETUP} element={<ProtectedRoute><JDSetupScreen user={user} onNavigate={handleNavigate} /></ProtectedRoute>} />
        <Route path={ROUTES.INTERVIEW} element={<ProtectedRoute><InterviewScreen user={user} onNavigate={handleNavigate} /></ProtectedRoute>} />
        <Route path={ROUTES.ANALYSIS} element={<ProtectedRoute><AnalysisScreen user={user} onNavigate={handleNavigate} /></ProtectedRoute>} />
        
        <Route path={ROUTES.CV_LANDING} element={<ProtectedRoute><CVLandingScreen user={user} onNavigate={handleNavigate} /></ProtectedRoute>} />
        <Route path={ROUTES.CV_ANALYSIS} element={<ProtectedRoute><CVAnalysisScreen user={user} onNavigate={handleNavigate} /></ProtectedRoute>} />
        <Route path={ROUTES.CV_EDITOR} element={<ProtectedRoute><CVEditorScreen user={user} onNavigate={handleNavigate} /></ProtectedRoute>} />
        
        <Route path={ROUTES.SETTINGS} element={<ProtectedRoute><SettingsScreen user={user} onNavigate={handleNavigate} onLogout={handleLogout} /></ProtectedRoute>} />
        <Route path={ROUTES.SUBSCRIPTION} element={<ProtectedRoute><SubscriptionScreen user={user} onNavigate={handleNavigate} onUpdateUser={handleLogin} /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
