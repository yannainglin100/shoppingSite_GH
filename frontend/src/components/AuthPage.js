import React, { useState } from 'react';

const AuthPage = ({ authUrl, setView, setUsername, setMsg, msg }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [localUsername, setLocalUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(false);
    setMsg('');

    if (isSignUp && password !== confirmPassword) {
      setMsg('Passwords do not match!');
      return;
    }

    setLoading(true);
    const endpoint = isSignUp ? 'signup' : 'login';
    const payload = { username: localUsername, password };

    try {
      const res = await fetch(`${authUrl}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        if (endpoint === 'login') {
          setUsername(data.username);
          setView(data.role === 'admin' ? 'adminDash' : 'userStore');
        } else {
          setMsg("Profile generated! Please log in.");
          setIsSignUp(false);
          setPassword('');
          setConfirmPassword('');
        }
      } else {
        setMsg(data.error || 'Authentication failed');
      }
    } catch (err) {
      setMsg('Network pipeline failure connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>👕 Apparel Cloud Core</h2>
        <p style={styles.subtitle}>
          {isSignUp ? 'Join our marketplace community today' : 'Sign in to continue shopping'}
        </p>

        {msg && (
          <div style={{
            ...styles.alert,
            backgroundColor: msg.includes('generated') ? '#e0f2fe' : '#fef2f2',
            color: msg.includes('generated') ? '#0369a1' : '#b91c1c'
          }}>
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={localUsername}
              onChange={e => setLocalUsername(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          {isSignUp && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                style={styles.input}
              />
            </div>
          )}

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Processing...' : isSignUp ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <div style={styles.toggleContainer}>
          <button onClick={() => { setIsSignUp(!isSignUp); setMsg(''); }} style={styles.toggleBtn}>
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#bae6fd', // Sky blue primary background canvas
    fontFamily: 'sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(2, 132, 199, 0.15)',
    width: '100%',
    maxWidth: '360px',
    textAlign: 'center',
  },
  title: {
    margin: '0 0 8px 0',
    color: '#0369a1',
    fontSize: '1.6rem',
    fontWeight: '700',
  },
  subtitle: {
    margin: '0 0 24px 0',
    color: '#64748b',
    fontSize: '0.9rem',
  },
  form: { textAlign: 'left' },
  inputGroup: { marginBottom: '16px' },
  label: {
    display: 'block',
    marginBottom: '6px',
    color: '#0369a1',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#f8fafc',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#0284c7', // Sky Blue primary action button
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
  alert: {
    padding: '10px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    marginBottom: '16px',
    textAlign: 'left',
  },
  toggleContainer: {
    marginTop: '20px',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '12px',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#0284c7',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
  }
};

export default AuthPage;