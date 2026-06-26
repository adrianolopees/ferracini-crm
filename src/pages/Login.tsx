import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { loginSchema, LoginFormData } from '@/schemas/loginSchema';
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
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
  });

  const fillDemo = () => {
    setValue('email', 'demo@lojacrm.com');
    setValue('password', 'demo123456');
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
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
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8 overflow-y-auto">
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

          {/* Demo banner */}
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
              Acesso de demonstração
            </p>
            <p className="text-sm text-blue-800 mb-3">
              <span className="font-mono">demo@lojacrm.com</span>
              {' · '}
              <span className="font-mono">demo123456</span>
            </p>
            <button
              type="button"
              onClick={fillDemo}
              className="text-xs font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900 transition-colors"
            >
              Preencher automaticamente
            </button>
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

            <Button type="submit" disabled={isLoading} fullWidth={true} className="flex justify-center">
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
        <p className="text-center text-gray-600 mt-6 text-sm">© 2025 Adriano Lopes. Todos os direitos reservados.</p>
      </div>
    </div>
  );
}

export default Login;
