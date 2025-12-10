
import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import { ROLES } from './constants/roles'
import bgImage from './assets/bg.jpg'
import logo from './assets/logo.png'
import { User, Lock } from 'lucide-react'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading, login, logout } = useAuth();

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const result = await login(formData.username, formData.password);
    
    if (!result.success) {
      setError(result.message || 'Invalid username or password');
    }
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'var(--bg-light)',
        color: 'var(--primary-blue)'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Dashboard onLogout={logout} />;
  }

  return (
    <div className="app-container">
      <header className="site-header">
        <div className="header-logo">
          <img src={logo} alt="NITRRFIE Logo" />
          <div className="header-title">
            <h1>NIT Raipur Foundation for Innovation & Entrepreneurship</h1>
            <p>(A Section 8 Company under Companies Act, 2013)</p>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="login-page">
          <div className="login-container">
            <div className="login-visual">
              <div className="login-visual-content">
                <h2>Welcome Back</h2>
                <p>Human Resource Management System</p>
              </div>
            </div>
            
            <div className="login-form-section">
              <div className="login-header">
                <h2>Login</h2>
                <p>Please enter your credentials to access your account</p>
              </div>

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Username</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input 
                      type="text" 
                      name="username" 
                      value={formData.username} 
                      onChange={handleInputChange} 
                      required 
                      disabled={isLoading}
                      placeholder="Enter your username"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input 
                      type="password" 
                      name="password" 
                      value={formData.password} 
                      onChange={handleInputChange} 
                      required 
                      disabled={isLoading}
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                <button className="submit-btn" type="submit" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="site-footer">
        <p>&copy; {new Date().getFullYear()} NIT Raipur Foundation for Innovation & Entrepreneurship. All Rights Reserved.</p>
        <p>G.E. Road, Raipur, Chhattisgarh - 492010</p>
      </footer>
    </div>
  )
}

export default App
