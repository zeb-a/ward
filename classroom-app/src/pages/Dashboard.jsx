import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Start with sidebar open on desktop
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const getSidebarClass = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      return `sidebar ${sidebarOpen ? 'expanded' : 'collapsed'}`;
    }
    return 'sidebar';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial',
      color: '#0b1220',
      background: 'radial-gradient(1200px 600px at 10% 10%, rgba(123,76,255,0.06), transparent 20%), linear-gradient(180deg,#f7fbff,#fff8ff)'
    }}>
      <style>
        {`
        @media (max-width: 768px) {
          .sidebar {
            width: 240px !important;
            left: 0;
            z-index: 1000;
          }
          .sidebar.collapsed {
            width: 0px !important;
            overflow: hidden;
          }
          .sidebar.expanded {
            width: 240px !important;
            overflow: visible;
          }
          .main-content {
            margin-left: 0;
          }
          .hamburger-menu {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .sidebar {
            width: 240px;
          }
          .hamburger-menu {
            display: none !important;
          }
        }
        .card-hover {
          transition: transform 0.28s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px) scale(1.02);
        }
        .nav-link-hover:hover {
          background: rgba(107,70,255,0.06) !important;
        }
        .signout-hover:hover {
          background: rgba(239,68,68,0.06) !important;
        }
      `}
      </style>
      {/* Sidebar */}
      <div className={getSidebarClass()} style={{
        width: typeof window !== 'undefined' && window.innerWidth <= 768 ? 
          (sidebarOpen ? '240px' : '0px') : 
          '240px', // Always 240px on desktop
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(12px)',
        borderRight: '1px solid rgba(11,18,32,0.06)',
        padding: '20px',
        position: 'fixed',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        transition: 'width 0.3s ease, transform 0.3s ease'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px',
            borderRadius: '12px',
            background: 'linear-gradient(180deg, rgba(123,76,255,0.06), rgba(255,255,255,0.3))'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6b46ff, #7dd7ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>
                {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Teacher
              </div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '4px' }}>
              <Link 
                to="/dashboard"
                className="nav-link-hover"
                style={{
                  display: 'block',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  color: '#6b7280',
                  fontWeight: '500',
                  transition: '0.2s',
                  background: 'transparent'
                }}
              >
                🏠 Dashboard
              </Link>
            </li>
            <li style={{ marginBottom: '4px' }}>
              <Link 
                to="/dashboard/students"
                className="nav-link-hover"
                style={{
                  display: 'block',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  color: '#6b7280',
                  fontWeight: '500',
                  transition: '0.2s',
                  background: 'transparent'
                }}
              >
                👥 Students
              </Link>
            </li>
            <li style={{ marginBottom: '4px' }}>
              <Link 
                to="/dashboard/classes"
                className="nav-link-hover"
                style={{
                  display: 'block',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  color: '#6b7280',
                  fontWeight: '500',
                  transition: '0.2s',
                  background: 'transparent'
                }}
              >
                🏫 Classes
              </Link>
            </li>
            <li style={{ marginBottom: '4px' }}>
              <Link 
                to="/dashboard/rewards"
                className="nav-link-hover"
                style={{
                  display: 'block',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  color: '#6b7280',
                  fontWeight: '500',
                  transition: '0.2s',
                  background: 'transparent'
                }}
              >
                🏆 Rewards
              </Link>
            </li>
            <li style={{ marginBottom: '4px' }}>
              <Link 
                to="/dashboard/games"
                className="nav-link-hover"
                style={{
                  display: 'block',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  color: '#6b7280',
                  fontWeight: '500',
                  transition: '0.2s',
                  background: 'transparent'
                }}
              >
                🎮 Games
              </Link>
            </li>
        <li style={{ marginBottom: '4px' }}>
          <Link 
            to="/dashboard/reports"
            className="nav-link-hover"
            style={{
              display: 'block',
              padding: '10px 12px',
              borderRadius: '10px',
              textDecoration: 'none',
              color: '#6b7280',
              fontWeight: '500',
              transition: '0.2s',
              background: 'transparent'
            }}
          >
            📊 Reports
          </Link>
        </li>
      </ul>
    </nav>

    <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(11,18,32,0.06)' }}>
      <button
        onClick={handleSignOut}
        className="signout-hover"
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: '10px',
          border: '1px solid rgba(11,18,32,0.06)',
          background: 'transparent',
          color: '#6b7280',
          fontWeight: '500',
          cursor: 'pointer',
          transition: '0.2s'
        }}
      >
        🔌 Sign Out
      </button>
    </div>
  </div>

  {/* Main Content */}
  <div style={{ 
    flex: 1, 
    marginLeft: '240px', 
    transition: 'margin-left 0.3s ease',
    width: 'calc(100% - 240px)'
  }}>
  <div className="main-content" style={{ flex: 1, width: '100%' }}>
    <header style={{
      padding: '20px 30px',
      borderBottom: '1px solid rgba(11,18,32,0.06)',
      background: 'rgba(255,255,255,0.72)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hamburger-menu"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            border: 0,
            background: 'linear-gradient(180deg, #fff, #fbfdff)',
            boxShadow: '0 8px 28px rgba(15,20,40,0.08)',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#6b46ff',
            display: 'flex'
          }}
        >
          <svg width="18" height="14" viewBox="0 0 18 14" xmlns="http://www.w3.org/2000/svg">
            <rect width="18" height="2" rx="1" fill="currentColor"/>
            <rect y="6" width="18" height="2" rx="1" fill="currentColor"/>
            <rect y="12" width="18" height="2" rx="1" fill="currentColor"/>
          </svg>
        </button>
        <h1 style={{
          margin: 0,
          fontSize: '20px',
          fontWeight: '700',
          background: 'linear-gradient(90deg, #7b46ff, #b86bff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Lil Fairy Award
        </h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 10px',
          borderRadius: '10px',
          background: 'linear-gradient(180deg, rgba(123,76,255,0.06), rgba(255,255,255,0.3))'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6b46ff, #7dd7ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '12px'
          }}>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>
            {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
          </span>
        </div>
      </div>
    </header>

    <main style={{ padding: '20px 30px' }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '20px',
          color: '#22143a'
        }}>
          Welcome back! 👋
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'linear-gradient(180deg, #ffffff, #fdfbff)',
            borderRadius: '18px',
            padding: '20px',
            boxShadow: '0 8px 28px rgba(15,20,40,0.08)',
            border: '1px solid rgba(120,110,255,0.06)',
            transition: '0.28s',
            cursor: 'pointer'
          }}
          className="card-hover"
          >
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>👥</div>
            <h4 style={{ margin: '6px 0 8px 0', fontSize: '15px' }}>Students</h4>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Manage your students and track their progress</p>
          </div>
          
          <div style={{
            background: 'linear-gradient(180deg, #ffffff, #fdfbff)',
            borderRadius: '18px',
            padding: '20px',
            boxShadow: '0 8px 28px rgba(15,20,40,0.08)',
            border: '1px solid rgba(120,110,255,0.06)',
            transition: '0.28s',
            cursor: 'pointer'
          }}
          className="card-hover"
          >
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🏫</div>
            <h4 style={{ margin: '6px 0 8px 0', fontSize: '15px' }}>Classes</h4>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Organize your classes and manage groups</p>
          </div>
          
          <div style={{
            background: 'linear-gradient(180deg, #ffffff, #fdfbff)',
            borderRadius: '18px',
            padding: '20px',
            boxShadow: '0 8px 28px rgba(15,20,40,0.08)',
            border: '1px solid rgba(120,110,255,0.06)',
            transition: '0.28s',
            cursor: 'pointer'
          }}
          className="card-hover"
          >
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🏆</div>
            <h4 style={{ margin: '6px 0 8px 0', fontSize: '15px' }}>Rewards</h4>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Create and manage rewards for students</p>
          </div>
          
          <div style={{
            background: 'linear-gradient(180deg, #ffffff, #fdfbff)',
            borderRadius: '18px',
            padding: '20px',
            boxShadow: '0 8px 28px rgba(15,20,40,0.08)',
            border: '1px solid rgba(120,110,255,0.06)',
            transition: '0.28s',
            cursor: 'pointer'
          }}
          className="card-hover"
          >
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📊</div>
            <h4 style={{ margin: '6px 0 8px 0', fontSize: '15px' }}>Reports</h4>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>View detailed reports and analytics</p>
          </div>
        </div>
        
        <div style={{
          background: 'white',
          borderRadius: '18px',
          padding: '24px',
          boxShadow: '0 8px 28px rgba(15,20,40,0.08)',
          border: '1px solid rgba(120,110,255,0.06)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Recent Activity</h3>
          <div style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>
            No recent activity to display. Your students' achievements will appear here.
          </div>
        </div>
      </div>
    </main>
  </div>
</div>
</div>
);
};