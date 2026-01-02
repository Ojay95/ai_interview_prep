
import React, { useState, useEffect } from 'react';
import { Screen, User } from './types';
import LandingScreen from './screens/LandingScreen';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import DashboardScreen from './screens/DashboardScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import JDSetupScreen from './screens/JDSetupScreen';
import InterviewScreen from './screens/InterviewScreen';
import AnalysisScreen from './screens/AnalysisScreen';
import SettingsScreen from './screens/SettingsScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Landing);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('mock_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('mock_user', JSON.stringify(u));
    setCurrentScreen(Screen.Dashboard);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mock_user');
    setCurrentScreen(Screen.Landing);
  };

  const navigate = (screen: Screen) => setCurrentScreen(screen);

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.Landing:
        return <LandingScreen onNavigate={navigate} />;
      case Screen.SignIn:
        return <SignInScreen onNavigate={navigate} onLogin={handleLogin} />;
      case Screen.SignUp:
        return <SignUpScreen onNavigate={navigate} onLogin={handleLogin} />;
      case Screen.Dashboard:
        return <DashboardScreen user={user} onNavigate={navigate} onLogout={handleLogout} />;
      case Screen.Onboarding:
        return <OnboardingScreen user={user} onNavigate={navigate} />;
      case Screen.JDSetup:
        return <JDSetupScreen user={user} onNavigate={navigate} />;
      case Screen.Interview:
        return <InterviewScreen user={user} onNavigate={navigate} />;
      case Screen.Analysis:
        return <AnalysisScreen user={user} onNavigate={navigate} />;
      case Screen.Settings:
        return <SettingsScreen user={user} onNavigate={navigate} onLogout={handleLogout} />;
      case Screen.Subscription:
        return <SubscriptionScreen user={user} onNavigate={navigate} onUpdateUser={handleLogin} />;
      default:
        return <LandingScreen onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderScreen()}
    </div>
  );
};

export default App;
