import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('teacher'); // State for role selection

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/login' : '/register';
    const payload = isLogin ? { email, password } : { email, password, role };

    try {
      const res = await axios.post(`http://localhost:5000${endpoint}`, payload);
      
      if (isLogin) {
        localStorage.setItem('token', res.data.token);
        alert(`Logged in! Redirecting to ${res.data.role} dashboard...`);
        // Logic to redirect would go here
      } else {
        alert("Registration Successful! Please login.");
        setIsLogin(true); // Switch to login view
      }
    } catch (err) {
      alert(err.response?.data || "An error occurred");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
          Capstone Project Portal
        </p>

        <form onSubmit={handleSubmit} style={formStyle}>
          <label style={labelStyle}>Email</label>
          <input 
            type="email" 
            style={inputStyle} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />

          <label style={labelStyle}>Password</label>
          <input 
            type="password" 
            style={inputStyle} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />

          {!isLogin && (
            <>
              <label style={labelStyle}>Select Role</label>
              <select 
                style={inputStyle} 
                value={role} 
                onChange={e => setRole(e.target.value)}
              >
                <option value="teacher">Teacher</option>
                <option value="researcher">Researcher</option>
              </select>
            </>
          )}

          <button type="submit" style={buttonStyle}>
            {isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '15px' }}>
          {isLogin ? "Need an account? " : "Already have an account? "}
          <span 
            style={{ color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
}

// --- STYLES ---
const containerStyle = {
  display: 'flex', justifyContent: 'center', alignItems: 'center', 
  height: '100vh', backgroundColor: '#eef2f3'
};
const cardStyle = {
  backgroundColor: 'white', padding: '30px', borderRadius: '15px', 
  boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '350px'
};
const formStyle = { display: 'flex', flexDirection: 'column' };
const labelStyle = { marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' };
const inputStyle = { padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc' };
const buttonStyle = {
  padding: '10px', backgroundColor: '#007bff', color: 'white', 
  border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
};

export default App;