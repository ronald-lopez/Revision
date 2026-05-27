import { AppProvider, useApp } from './context/AppContext.jsx';
import AuthScreen from './components/AuthScreen.jsx';
import SetupScreen from './components/SetupScreen.jsx';
import Topbar from './components/layout/Topbar.jsx';
import HomePage from './components/home/HomePage.jsx';
import ForgePage from './components/forge/ForgePage.jsx';
import AtlasPage from './components/atlas/AtlasPage.jsx';
import FluxPage from './components/flux/FluxPage.jsx';
import ProgressPage from './components/progress/ProgressPage.jsx';
import SettingsPage from './components/settings/SettingsPage.jsx';
import Toast from './components/common/Toast.jsx';

function AppInner() {
  const { screen, currentPage } = useApp();

  if (screen === 'auth') return <AuthScreen />;
  if (screen === 'setup') return <SetupScreen />;

  return (
    <div className="app-shell">
      <Topbar />
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'forge' && <ForgePage />}
      {currentPage === 'atlas' && <AtlasPage />}
      {currentPage === 'flux' && <FluxPage />}
      {currentPage === 'progress' && <ProgressPage />}
      {currentPage === 'settings' && <SettingsPage />}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
