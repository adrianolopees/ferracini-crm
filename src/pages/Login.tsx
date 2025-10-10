import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { loginShcema, LoginFormData } from '@/schemas/loginSchema';
import { getFirebaseErrorMessage } from '@/utils';
import { Spinner, Button, Input } from '@/components/ui';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginShcema),
    mode: 'onSubmit',
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/register');
    } catch (error) {
      const errorMessage = getFirebaseErrorMessage(error);
      setError('root', {
        type: 'manuel',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Card do Login */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <i className="fa-solid fa-store text-white text-xl"></i>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Ferracini</h1>
            <p className="text-gray-600 text-sm">Sistema de Reservas</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {errors.root && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <span className="bi bi-exclamation-triangle-fill"></span>
                <span className="text-sm">{errors.root.message}</span>
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
              error={errors.email?.message}
              disabled={isLoading}
              required
            />

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
              disabled={isLoading}
              required
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" />
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 mt-6 text-sm">
          © 2025 Ferracini Maxi CRM. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}

export default Login;
