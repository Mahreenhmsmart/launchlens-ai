import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { Spinner } from '@/components/ui';

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const navigate = useNavigate();
  const { isAuthenticated, loading, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!loading && isAuthenticated && user?.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, loading, user, navigate]);

  // Show spinner while checking auth status
  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background"
        data-icod-id="src_components_adminroute_tsx_9e4a">
        <Spinner size="lg" data-icod-id="src_components_adminroute_tsx_d68c" />
      </div>
    );
  }

  // Redirect to dashboard if not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
