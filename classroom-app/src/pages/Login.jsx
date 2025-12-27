import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(1200px 600px at 10% 10%, rgba(123,76,255,0.06), transparent 20%), linear-gradient(180deg,#f7fbff,#fff8ff)',
      fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial',
      color: '#0b1220'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '32px auto',
        padding: '36px',
        width: '100%',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(12px)',
          padding: '22px',
          borderRadius: '18px',
          maxWidth: '560px',
          width: '100%',
          boxShadow: '0 24px 80px rgba(10,12,30,0.22)',
          border: '1px solid rgba(11,18,32,0.04)',
          fontFamily: 'Inter,system-ui,-apple-system,Segoe UI,Roboto'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '6px', fontSize: '20px' }}>Welcome back</h3>
          <p className="sub" style={{ margin: '0 0 12px 0', color: '#6b7280', fontSize: '14px' }}>Sign in to your account to continue</p>
          
          {error && (
            <div style={{
              color: '#b91c1c',
              fontSize: '13px',
              marginBottom: '12px',
              padding: '8px',
              backgroundColor: 'rgba(248,113,113,0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(248,113,113,0.2)'
            }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #eef2f8',
                  background: 'linear-gradient(180deg,#fff,#fbfdff)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #eef2f8',
                  background: 'linear-gradient(180deg,#fff,#fbfdff)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(11,18,32,0.06)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  color: '#6b7280'
                }}
              >
                Sign Up
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg,#6b46ff,#9aa8ff)',
                  color: '#fff',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: 0,
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? (
                  <span style={{
                    display: 'inline-block',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderTopColor: 'rgba(255,255,255,0.95)',
                    animation: 'spin .9s linear infinite',
                    verticalAlign: 'middle'
                  }}></span>
                ) : 'Log In'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};