import React, { useState } from 'react';
import { adminApi } from '../services/api';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter your admin password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await adminApi.login(password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="glass-panel login-card">
        <h1 className="login-title">Portfolio Admin</h1>
        <p className="login-subtitle">Enter security password to access content engine</p>
        
        {error && (
          <div className="alert alert-danger">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label htmlFor="adminPassword">Master Password</label>
            <input
              id="adminPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={loading}
              autoFocus
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem', height: '50px' }}
            disabled={loading}
          >
            {loading ? <div className="spinner" style={{ margin: 'auto' }}></div> : 'Decrypt Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
