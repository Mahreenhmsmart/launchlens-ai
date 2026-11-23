import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, register, forgotPassword, resetPassword, clearError } from '@/store/slices/authSlice';
import { Button, Input, Field, Alert, Spinner } from '@/components/ui';
import LaunchLensLogo from '@/components/LaunchLensLogo';
import { cn } from '@/utils/cn';

type AuthView = 'login' | 'signup' | 'forgot-password' | 'reset-password';

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  // Determine initial view based on URL params
  const resetToken = searchParams.get('token');
  const tabParam = searchParams.get('tab');
  const [view, setView] = useState<AuthView>(
    resetToken ? 'reset-password' : tabParam === 'signup' ? 'signup' : 'login'
  );

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetTokenValue, setResetTokenValue] = useState<string | null>(resetToken);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when switching views
  useEffect(() => {
    setLocalError(null);
    setSuccessMessage(null);
    dispatch(clearError());
  }, [view, dispatch]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    await dispatch(login({ email, password }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    if (!name || !email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    await dispatch(register({ name, email, password }));
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    if (!email) {
      setLocalError('Please enter your email address');
      return;
    }

    const result = await dispatch(forgotPassword({ email }));
    if (forgotPassword.fulfilled.match(result)) {
      setSuccessMessage(
        'If an account with that email exists, a password reset link has been sent. ' +
        'Note: Email delivery is SMTP-dependent and will be connected in a future phase.'
      );
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    if (!resetTokenValue) {
      setLocalError('Invalid or missing reset token');
      return;
    }

    if (!password || !confirmPassword) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    const result = await dispatch(resetPassword({ token: resetTokenValue, password }));
    if (resetPassword.fulfilled.match(result)) {
      setSuccessMessage('Password has been reset successfully. You can now log in.');
      setTimeout(() => setView('login'), 2000);
    }
  };

  const displayError = localError || error;

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(100deg, #DE85E2, #DE8DDB, #E4B2BE, #E9BCA6, #ECA58B, #EACAA1)' }}
      data-icod-id="src_pages_auth_tsx_88e7">
      <div
        className="w-full max-w-md rounded-2xl bg-[#FDFDFD] p-8 shadow-xl"
        data-icod-id="src_pages_auth_tsx_b417">
        {/* Logo - Using LaunchLensLogo component with light variant for dark background */}
        <div
          className="-mx-8 -mt-8 mb-8 flex justify-center rounded-t-2xl bg-[#2A1F2E] py-8"
          data-icod-id="src_pages_auth_tsx_8768">
          <LaunchLensLogo size="xl" theme="dark" data-icod-id="src_pages_auth_tsx_c7c4" />
        </div>

        {/* View Title */}
        <h1
          className="mb-6 text-center text-2xl font-bold text-[#171717]"
          data-icod-id="src_pages_auth_tsx_c4b7">
          {view === 'login' && 'Welcome Back'}
          {view === 'signup' && 'Create Account'}
          {view === 'forgot-password' && 'Forgot Password'}
          {view === 'reset-password' && 'Reset Password'}
        </h1>

        {/* Error Alert */}
        {displayError && (
          <Alert variant="error" className="mb-4" data-icod-id="src_pages_auth_tsx_0d45">
            {displayError}
          </Alert>
        )}

        {/* Success Message */}
        {successMessage && (
          <Alert variant="success" className="mb-4" data-icod-id="src_pages_auth_tsx_f4fb">
            {successMessage}
          </Alert>
        )}

        {/* Login Form */}
        {view === 'login' && (
          <form
            onSubmit={handleLogin}
            className="space-y-4"
            data-icod-id="src_pages_auth_tsx_9a14">
            <Field
              label="Email"
              htmlFor="login-email"
              required
              data-icod-id="src_pages_auth_tsx_b6b3">
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-[#F6F6F6] focus:border-[#C9D0FC]"
                data-icod-id="src_pages_auth_tsx_768d" />
            </Field>

            <Field
              label="Password"
              htmlFor="login-password"
              required
              data-icod-id="src_pages_auth_tsx_d2bc">
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-[#F6F6F6] focus:border-[#C9D0FC]"
                data-icod-id="src_pages_auth_tsx_a9b6" />
            </Field>

            <Button
              type="submit"
              className="w-full"
              style={{ background: 'linear-gradient(to right, #DE85E2, #C9D0FC)' }}
              loading={loading}
              data-icod-id="src_pages_auth_tsx_2eb9">
              Sign In
            </Button>

            <div
              className="flex justify-between text-sm"
              data-icod-id="src_pages_auth_tsx_09d6">
              <button
                type="button"
                onClick={() => setView('forgot-password')}
                className="text-[#171717]/60 hover:text-[#171717] hover:underline"
                data-icod-id="src_pages_auth_tsx_1a24">
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => setView('signup')}
                className="text-[#171717]/60 hover:text-[#171717] hover:underline"
                data-icod-id="src_pages_auth_tsx_2662">
                Create account
              </button>
            </div>
          </form>
        )}

        {/* Signup Form */}
        {view === 'signup' && (
          <form
            onSubmit={handleRegister}
            className="space-y-4"
            data-icod-id="src_pages_auth_tsx_bc10">
            <Field
              label="Full Name"
              htmlFor="signup-name"
              required
              data-icod-id="src_pages_auth_tsx_6e7e">
              <Input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="bg-[#F6F6F6] focus:border-[#C9D0FC]"
                data-icod-id="src_pages_auth_tsx_4416" />
            </Field>

            <Field
              label="Email"
              htmlFor="signup-email"
              required
              data-icod-id="src_pages_auth_tsx_d900">
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-[#F6F6F6] focus:border-[#C9D0FC]"
                data-icod-id="src_pages_auth_tsx_4bdf" />
            </Field>

            <Field
              label="Password"
              htmlFor="signup-password"
              required
              hint="Must be at least 6 characters"
              data-icod-id="src_pages_auth_tsx_69cd">
              <Input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="bg-[#F6F6F6] focus:border-[#C9D0FC]"
                data-icod-id="src_pages_auth_tsx_b411" />
            </Field>

            <Button
              type="submit"
              className="w-full"
              style={{ background: 'linear-gradient(to right, #DE85E2, #C9D0FC)' }}
              loading={loading}
              data-icod-id="src_pages_auth_tsx_9574">
              Create Account
            </Button>

            <div className="text-center text-sm" data-icod-id="src_pages_auth_tsx_c278">
              <button
                type="button"
                onClick={() => setView('login')}
                className="text-[#171717]/60 hover:text-[#171717] hover:underline"
                data-icod-id="src_pages_auth_tsx_3e07">
                Already have an account? Sign in
              </button>
            </div>
          </form>
        )}

        {/* Forgot Password Form */}
        {view === 'forgot-password' && (
          <form
            onSubmit={handleForgotPassword}
            className="space-y-4"
            data-icod-id="src_pages_auth_tsx_59e3">
            <p
              className="mb-4 text-sm text-[#171717]/70"
              data-icod-id="src_pages_auth_tsx_68d7">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <Field
              label="Email"
              htmlFor="forgot-email"
              required
              data-icod-id="src_pages_auth_tsx_3043">
              <Input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-[#F6F6F6] focus:border-[#C9D0FC]"
                data-icod-id="src_pages_auth_tsx_dec9" />
            </Field>

            <Button
              type="submit"
              className="w-full"
              style={{ background: 'linear-gradient(to right, #DE85E2, #C9D0FC)' }}
              loading={loading}
              data-icod-id="src_pages_auth_tsx_c2e2">
              Send Reset Link
            </Button>

            <div className="text-center text-sm" data-icod-id="src_pages_auth_tsx_57b1">
              <button
                type="button"
                onClick={() => setView('login')}
                className="text-[#171717]/60 hover:text-[#171717] hover:underline"
                data-icod-id="src_pages_auth_tsx_0a97">
                Back to sign in
              </button>
            </div>
          </form>
        )}

        {/* Reset Password Form */}
        {view === 'reset-password' && (
          <form
            onSubmit={handleResetPassword}
            className="space-y-4"
            data-icod-id="src_pages_auth_tsx_fa7e">
            {!resetTokenValue && (
              <Alert variant="warning" className="mb-4" data-icod-id="src_pages_auth_tsx_e56e">
                No reset token provided. Please use the link from your email.
              </Alert>
            )}

            <Field
              label="New Password"
              htmlFor="reset-password"
              required
              hint="Must be at least 6 characters"
              data-icod-id="src_pages_auth_tsx_0f13">
              <Input
                id="reset-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="bg-[#F6F6F6] focus:border-[#C9D0FC]"
                data-icod-id="src_pages_auth_tsx_d734" />
            </Field>

            <Field
              label="Confirm Password"
              htmlFor="reset-confirm"
              required
              data-icod-id="src_pages_auth_tsx_42df">
              <Input
                id="reset-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="bg-[#F6F6F6] focus:border-[#C9D0FC]"
                data-icod-id="src_pages_auth_tsx_19d6" />
            </Field>

            <Button
              type="submit"
              className="w-full"
              style={{ background: 'linear-gradient(to right, #DE85E2, #C9D0FC)' }}
              loading={loading}
              disabled={!resetTokenValue}
              data-icod-id="src_pages_auth_tsx_9eb3">
              Reset Password
            </Button>

            <div className="text-center text-sm" data-icod-id="src_pages_auth_tsx_4492">
              <button
                type="button"
                onClick={() => setView('login')}
                className="text-[#171717]/60 hover:text-[#171717] hover:underline"
                data-icod-id="src_pages_auth_tsx_9939">
                Back to sign in
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
