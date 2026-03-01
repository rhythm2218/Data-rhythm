import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api, { login } from '../services/api';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailNotVerified(false);
    setLoading(true);

    try {
      const response = await login(email, password);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      
      if (errorMessage.includes('verify your email')) {
        setEmailNotVerified(true);
        setUnverifiedEmail(email);
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      const response = await api.post('/auth/resend-verification', { email: unverifiedEmail });
      setError('');
      alert(response.data.message || 'Verification email sent!');
      setEmailNotVerified(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        {emailNotVerified && (
          <div className="error-message">
            <p>Your email has not been verified yet.</p>
            <button 
              onClick={handleResendVerification}
              disabled={resendLoading}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: '#c33',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              {resendLoading ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
