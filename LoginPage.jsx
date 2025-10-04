import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Iniciar Sesión</h2>
        <AuthForm
          onSubmit={handleLogin}
          submitText="Login"
        />
      </div>
    </div>
  );
};

export default LoginPage;