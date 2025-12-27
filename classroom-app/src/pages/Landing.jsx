import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export const Landing = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(1200px 600px at 10% 10%, rgba(123,76,255,0.06), transparent 20%), linear-gradient(180deg,#f7fbff,#fff8ff)',
      fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial',
      color: '#0b1220',
      '-webkit-font-smoothing': 'antialiased'
    }}>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }
        .reveal {
          opacity: 0;
          transform: translateY(10px) scale(0.998);
          animation: reveal 700ms cubic-bezier(.16,.8,.24,1) both;
        }
        .reveal.delay-1 {
          animation-delay: 120ms;
        }
        .reveal.delay-2 {
          animation-delay: 260ms;
        }
        .reveal.delay-3 {
          animation-delay: 420ms;
        }
        .reveal.delay-4 {
          animation-delay: 600ms;
        }
        @keyframes reveal {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .card-hover {
          transition: transform 0.28s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px) scale(1.02);
        }
        .nav-link-hover {
          transition: 0.24s;
        }
        .nav-link-hover:hover {
          background: linear-gradient(90deg, rgba(107,70,255,0.06), rgba(125,215,255,0.03));
          color: #6b46ff;
        }
      `}</style>

      {/* Header */}
      <div style={{
        maxWidth: '1200px',
        margin: '32px auto',
        padding: '0 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '18px',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Lil fairy logo">
              <defs>
                <linearGradient id="lgMark" x1="0" x2="1">
                  <stop offset="0" stopColor="#9b6bff" />
                  <stop offset="1" stopColor="#7dd7ff" />
                </linearGradient>
                <filter id="f" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#6b46ff" floodOpacity="0.12" />
                </filter>
              </defs>
              <g filter="url(#f)">
                <circle cx="32" cy="32" r="28" fill="url(#lgMark)" />
              </g>
              <g transform="translate(12,12)">
                <path d="M8 18c4-6 18-6 20 0" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.95"/>
                <g transform="translate(20,6) rotate(-18)">
                  <ellipse rx="6" ry="10" fill="#fff" opacity="0.92"/>
                </g>
                <g transform="translate(6,6) rotate(18)">
                  <ellipse rx="4" ry="8" fill="#fff" opacity="0.9"/>
                </g>
                <circle cx="8" cy="10" r="2" fill="#fff"/>
              </g>
              <g>
                <circle cx="50" cy="14" r="3" fill="#ffd36b" opacity="0.95"/>
              </g>
            </svg>
          </div>
          <div>
            <div style={{
              fontWeight: '800',
              fontSize: '18px',
              color: '#2b2246',
              fontFamily: "'Poppins', Inter, system-ui, -apple-system, 'Segoe UI', Roboto"
            }}>
              Lil fairy award
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6b7280'
            }}>
              Celebrate learning with magic
            </div>
          </div>
        </div>

        <nav style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <a 
            href="#features" 
            className="nav-link-hover"
            style={{
              color: '#6b7280',
              textDecoration: 'none',
              padding: '8px 10px',
              borderRadius: '10px',
              fontWeight: '600',
              transition: '0.24s'
            }}
          >
            Features
          </a>
          <a 
            href="#how" 
            className="nav-link-hover"
            style={{
              color: '#6b7280',
              textDecoration: 'none',
              padding: '8px 10px',
              borderRadius: '10px',
              fontWeight: '600',
              transition: '0.24s'
            }}
          >
            How it works
          </a>
          <a 
            href="#about" 
            className="nav-link-hover"
            style={{
              color: '#6b7280',
              textDecoration: 'none',
              padding: '8px 10px',
              borderRadius: '10px',
              fontWeight: '600',
              transition: '0.24s'
            }}
          >
            About
          </a>
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <button 
              onClick={handleLogin}
              style={{
                background: 'transparent',
                border: '1px solid rgba(11,18,32,0.06)',
                padding: '8px 12px',
                borderRadius: '10px',
                cursor: 'pointer',
                color: '#6b7280',
                transition: '0.24s'
              }}
              className="nav-link-hover"
            >
              Log In
            </button>
            <button 
              onClick={handleGetStarted}
              style={{
                background: 'linear-gradient(135deg, #6b46ff, #b86bff)',
                color: '#fff',
                padding: '10px 14px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '800',
                boxShadow: '0 8px 28px rgba(15,20,40,0.08)',
                transition: '0.24s',
                border: '0',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.04)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)')}
            >
              Sign Up
            </button>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 36px',
        display: 'grid',
        gridTemplateColumns: '1fr 480px',
        gap: '32px',
        alignItems: 'center',
        marginTop: '10px',
        position: 'relative'
      }}>
        <div className="reveal delay-1" style={{
          maxWidth: '720px'
        }}>
          <h1 style={{
            fontSize: '48px',
            lineHeight: '1.02',
            margin: '0 0 14px 0',
            color: '#22143a',
            fontWeight: '900',
            fontFamily: "'Poppins', Inter, system-ui, -apple-system, 'Segoe UI', Roboto",
            background: 'linear-gradient(90deg, #7b46ff, #b86bff)',
            '-webkit-background-clip': 'text',
            '-webkit-text-fill-color': 'transparent'
          }}>
            Celebrate learning — tiny wins, big smiles.
          </h1>
          <div style={{
            color: '#6b7280',
            fontSize: '18px',
            marginBottom: '20px',
            opacity: '0.92'
          }}>
            Lil Fairy helps teachers reward progress with colorful badges, playful celebrations, and printable reports — designed for joyful classrooms.
          </div>
          <div style={{
            display: 'flex',
            gap: '14px',
            alignItems: 'center'
          }}>
            <button 
              onClick={handleGetStarted}
              style={{
                background: 'linear-gradient(90deg, #6b46ff, #b86bff)',
                color: '#fff',
                padding: '14px 20px',
                borderRadius: '14px',
                border: '0',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: '0 20px 60px rgba(15,20,40,0.12)',
                transition: '0.28s',
                fontSize: '16px'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.04)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)')}
            >
              Get Started — it's free
            </button>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})}
              style={{
                background: 'transparent',
                border: '2px solid rgba(11,18,32,0.2)',
                padding: '12px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                color: '#6b7280',
                fontWeight: '700',
                transition: '0.24s'
              }}
              className="nav-link-hover"
            >
              Explore features
            </button>
          </div>

          <div style={{
            marginTop: '22px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              minWidth: '220px',
              padding: '20px',
              borderRadius: '18px',
              background: 'linear-gradient(180deg, #fff, #fdfbff)',
              boxShadow: '0 8px 28px rgba(15,20,40,0.08)',
              border: '1px solid rgba(120,110,255,0.06)',
              transition: '0.28s'
            }} className="card-hover">
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ffdede, #fff6e6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800'
              }}>
                🏅
              </div>
              <div>
                <div style={{
                  fontWeight: '800'
                }}>
                  For teachers
                </div>
                <div style={{
                  color: '#6b7280',
                  fontSize: '13px'
                }}>
                  Quick setup, class management, and reports
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              minWidth: '220px',
              padding: '20px',
              borderRadius: '18px',
              background: 'linear-gradient(180deg, #fff, #fdfbff)',
              boxShadow: '0 8px 28px rgba(15,20,40,0.08)',
              border: '1px solid rgba(120,110,255,0.06)',
              transition: '0.28s'
            }} className="card-hover">
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #e6f8ff, #eaf8ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800'
              }}>
                ✨
              </div>
              <div>
                <div style={{
                  fontWeight: '800'
                }}>
                  For students
                </div>
                <div style={{
                  color: '#6b7280',
                  fontSize: '13px'
                }}>
                  Playful animations and stickers that encourage growth
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="reveal delay-4" style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '460px',
            height: 'auto',
            borderRadius: '24px',
            background: 'linear-gradient(180deg, rgba(123,76,255,0.06), rgba(125,215,255,0.03))',
            boxShadow: '0 20px 60px rgba(15,20,40,0.12)',
            padding: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <svg width="460" height="340" viewBox="0 0 460 340" xmlns="http://www.w3.org/2000/svg" aria-label="Floating cartoon fairy with magical trail" role="img">
              <defs>
                <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffd1e6"/>
                  <stop offset="100%" stopColor="#ffb3d9"/>
                </linearGradient>
                <linearGradient id="dressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff8ce2"/>
                  <stop offset="100%" stopColor="#ff60c3"/>
                </linearGradient>
                <linearGradient id="wingGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#a0eaff" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#7dd7ff" stopOpacity="0.4"/>
                </linearGradient>
                <linearGradient id="trailGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6b46ff" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#ffd36b" stopOpacity="0"/>
                </linearGradient>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="blur"/>
                  <feOffset dx="0" dy="4" result="offsetBlur"/>
                  <feFlood floodColor="#6b46ff" floodOpacity="0.15" result="offsetColor"/>
                  <feComposite in="offsetColor" in2="offsetBlur" operator="in" result="offsetFill"/>
                  <feMerge>
                    <feMergeNode in="offsetFill"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <g filter="url(#shadow)">
                <path d="M230 240 Q280 180 330 240 T430 240" stroke="url(#trailGrad)" strokeWidth="8" fill="none" opacity="0.6" strokeDasharray="12 8"/>
                <g transform="translate(230,120) scale(0.8)">
                  <path d="M0 0 Q15 -40 30 0 T60 0 L50 20 C50 30 40 40 30 40 C20 40 10 30 10 20 Z" fill="url(#bodyGrad)" stroke="#ff9ec0" strokeWidth="1"/>
                  <path d="M20 10 Q30 5 40 10" fill="none" stroke="#ff60c3" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M10 20 Q30 30 50 20" fill="url(#dressGrad)" stroke="#ff60c3" strokeWidth="1"/>
                  <circle cx="20" cy="15" r="5" fill="#6b46ff"/>
                  <circle cx="40" cy="15" r="5" fill="#6b46ff"/>
                  <path d="M25 25 Q30 35 35 25" fill="#ff9ec0" stroke="#ff60c3" strokeWidth="1"/>
                  <path d="M0 5 Q-20 -10 -30 5 L-25 10 Q-15 15 0 5" fill="url(#wingGrad)" stroke="#7dd7ff" strokeWidth="1" opacity="0.7"/>
                  <path d="M0 5 Q20 -10 30 5 L25 10 Q15 15 0 5" fill="url(#wingGrad)" stroke="#7dd7ff" strokeWidth="1" opacity="0.7"/>
                  <g className="spark" style={{transformOrigin: '50% 50%', animation: 'float 4s ease-in-out infinite'}}>
                    <circle cx="-10" cy="-20" r="3" fill="#ffd36b" opacity="0.9"/>
                    <circle cx="45" cy="-15" r="2" fill="#6b46ff" opacity="0.8"/>
                    <circle cx="15" cy="-25" r="2.5" fill="#7dd7ff" opacity="0.85"/>
                  </g>
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" style={{
        maxWidth: '1200px',
        margin: '60px auto',
        padding: '0 36px'
      }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '40px',
          color: '#22143a'
        }}>
          Everything you need to celebrate learning
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '22px'
        }}>
          {[
            { emoji: '🏆', title: 'Badge System', desc: 'Create custom badges and reward student achievements' },
            { emoji: '📊', title: 'Progress Tracking', desc: 'Monitor student growth with detailed analytics' },
            { emoji: '🎮', title: 'Educational Games', desc: 'Engage students with fun learning activities' },
            { emoji: '🖨️', title: 'Printable Reports', desc: 'Generate beautiful reports to share progress' }
          ].map((feature, index) => (
            <div key={index} className="card-hover" style={{
              padding: '20px',
              borderRadius: '18px',
              background: 'linear-gradient(180deg, #fff, #fdfbff)',
              boxShadow: '0 8px 28px rgba(15,20,40,0.08)',
              border: '1px solid rgba(120,110,255,0.06)',
              transition: '0.28s'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>{feature.emoji}</div>
              <h4 style={{ margin: '6px 0 8px 0', fontSize: '15px' }}>{feature.title}</h4>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        marginTop: '60px',
        color: '#6b7280',
        fontSize: '14px',
        padding: '18px 0',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 36px' }}>
          © {new Date().getFullYear()} Lil fairy award — Celebrate classroom magic
        </div>
      </footer>
    </div>
  );
};