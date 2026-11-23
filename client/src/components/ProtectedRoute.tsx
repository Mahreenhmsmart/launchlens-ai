import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { Spinner } from '@/components/ui';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Show spinner while checking auth status
  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background"
        data-icod-id="src_components_protectedroute_tsx_6f1c">
        <Spinner size="lg" data-icod-id="src_components_protectedroute_tsx_ae72" />
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
