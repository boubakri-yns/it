import { Suspense, useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import { appRoutes } from './routes';
import { useAuth } from './hooks/useAuth';

function App() {
  const element = useRoutes(appRoutes);
  const { preloadRolePages } = useAuth();

  useEffect(() => {
    preloadRolePages();
  }, [preloadRolePages]);

  return <Suspense fallback={<div className="p-8 text-center">Chargement...</div>}>{element}</Suspense>;
}

export default App;
