import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../services/api';
import './Auth.css';

function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await signup(formData);
      setLoading(false);
      setSignupSuccess(true);
      setUserEmail(formData.email);
    } catch (err) {
      setLoading(false);
      if (err.response?.data?.errors) {
        const errorMessage = err.response.data.errors
          .map((e) => e.msg)
          .join(', ');
        setError(errorMessage);
      } else {
        setError(err.response?.data?.message || 'Signup failed. Please try again.');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card signup-card">
        {signupSuccess ? (
          <>
            <h2>Signup Successful!</h2>
            <div className="success-message">
              <p>Thank you for signing up! A verification email has been sent to <strong>{userEmail}</strong></p>
              <p>Please check your email and click the verification link to activate your account.</p>
              <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                If you don't see the email, please check your spam folder. The verification link expires in 24 hours.
              </p>
            </div>
            <button 
              className="btn-submit" 
              onClick={() => navigate('/login')}
              style={{ marginTop: '20px' }}
            >
              Go to Login
            </button>
            <p className="auth-link">
              Didn't receive the email? <Link to="/login">Try logging in or request a new link</Link>
            </p>
          </>
        ) : (
          <>
            <h2>Sign Up</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="John"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="At least 6 characters"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Signup;
