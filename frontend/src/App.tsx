import { useEffect, useState } from 'react';
import { useAuthStore } from './store';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

type Page = 'login' | 'register' | 'dashboard';

function App() {
  const { user, token } = useAuthStore();
  const [currentPage, setCurrentPage] = useState<Page>('login');

  useEffect(() => {
    if (user && token) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('login');
    }
  }, [user, token]);

  return (
    <>
      {!user ? (
        currentPage === 'login' ? (
          <LoginPage onSwitchToRegister={() => setCurrentPage('register')} />
        ) : (
          <RegisterPage onSwitchToLogin={() => setCurrentPage('login')} />
        )
      ) : (
        <DashboardPage />
      )}
    </>
  );
}

export default App;
