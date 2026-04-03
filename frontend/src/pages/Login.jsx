import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import GoogleLoginButton from '../components/GoogleLoginButton';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, signup } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      result = await signup(formData.name, formData.email, formData.password);
    }

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f1b' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: '#1a1a2e', borderRadius: '12px', border: '1px solid #333', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
        <h2 style={{ color: '#fff', marginBottom: '8px', fontSize: '24px', textAlign: 'center' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p style={{ color: '#aaa', marginBottom: '24px', fontSize: '14px', textAlign: 'center' }}>{isLogin ? 'Login to continue coding' : 'Join CollabCode to start your projects'}</p>

        {error && <div style={{ padding: '10px', backgroundColor: '#ff444422', border: '1px solid #ff4444', color: '#ff4444', borderRadius: '6px', marginBottom: '20px', fontSize: '13px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#0f0f1b', color: '#fff' }}
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#0f0f1b', color: '#fff' }}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#0f0f1b', color: '#fff' }}
          />
          <button type="submit" style={{ padding: '12px', backgroundColor: '#6c63ff', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>
            {isLogin ? 'Login' : 'Signup'}
          </button>
        </form>

        <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#333' }}></div>
          <span style={{ color: '#666', fontSize: '12px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#333' }}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <GoogleLoginButton />
        </div>

        <p style={{ textAlign: 'center', color: '#aaa', fontSize: '14px' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#6c63ff', cursor: 'pointer', fontWeight: 'bold' }}>{isLogin ? 'Signup' : 'Login'}</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
