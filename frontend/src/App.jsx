
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
        background: '#1a1a2e'
      }}>
        <div style={{ color: '#fff', fontSize: '1.5rem' }}>Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Dashboard onLogout={logout} />;
  }

  return (
    <div style={{
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center 20%',
      height: '100vh',
      width: '100vw',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: "'Poppins', sans-serif"
    }}>
      <div className="container">
        <div className="curved-shape"></div>
        <div className="curved-shape2"></div>

        <div className="form-box Login">
          <h2 className="animation" style={{ '--D': 0, '--S': 21 }}>Login</h2>
          <form onSubmit={handleLogin}>
            <div className="input-box animation" style={{ '--D': 1, '--S': 22 }}>
              <input type="text" name="username" value={formData.username} onChange={handleInputChange} required disabled={isLoading} />
              <label>Username</label>
              <User className="icon" size={20} color="gray" />
            </div>

            <div className="input-box animation" style={{ '--D': 2, '--S': 23 }}>
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} required disabled={isLoading} />
              <label>Password</label>
              <Lock className="icon" size={20} color="gray" />
            </div>

            {error && (
              <div className="error-message animation" style={{ '--D': 2.5, '--S': 23.5 }}>
                {error}
              </div>
            )}

            <div className="input-box animation" style={{ '--D': 3, '--S': 24 }}>
              <button className="btn" type="submit" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        </div>

        <div className="info-content Login">
          <img src={logo} alt="NITRRFIE Logo" className="logo-overlay animation" style={{ '--D': 0, '--S': 20 }} />
        </div>
      </div>
    </div>
  )
}

export default App
