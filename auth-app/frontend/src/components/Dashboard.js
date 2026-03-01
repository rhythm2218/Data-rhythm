import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../services/api';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div className="dashboard-container"><p>Loading...</p></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2>Welcome, {user?.firstName}!</h2>
        <div className="user-info">
          <p><strong>First Name:</strong> {user?.firstName}</p>
          <p><strong>Last Name:</strong> {user?.lastName}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Date of Birth:</strong> {user?.dateOfBirth}</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
