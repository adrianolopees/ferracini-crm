import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { loginShcema, LoginFormData } from '../schemas/loginSchema';
import Input from '../components/ui/Input';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';

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
    <div className="page-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="container">
        <Input
          label="Email:"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          disabled={isLoading}
          required
        />
        <Input
          label="Senha:"
          type="password"
          {...register('password')}
          error={errors.password?.message}
          disabled={isLoading}
          required
        />
        {errors.root && <p style={{ color: 'red' }}>{errors.root.message}</p>}
        <button type="submit" className="btn">
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

export default Login;
