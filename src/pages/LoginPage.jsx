import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';
import logo from '../assets/taskmastericon.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  // Normalisasi URL agar tidak ada double slash saat digabung dengan endpoint
  const API_URL = process.env.REACT_APP_API_URL?.replace(/\/$/, "");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Membersihkan penulisan URL agar tidak ada karakter tersembunyi
      const response = await axios.post(`${API_URL}/login`, {
        email: email,
        password: password
      }, {
        withCredentials: true
      });

      // Menyimpan token ke localStorage
      localStorage.setItem('accessToken', response.data.accessToken);

      navigate('/dashboard');
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg);
      } else {
        setMsg("Gagal terhubung ke server. Pastikan Backend menyala di Port 5001.");
      }
    }
  };

  return (
    <div className="login-wrapper">
      <nav className="top-nav">
        <button className="btn-back" onClick={() => navigate('/')}>
          ❮ Kembali
        </button>
      </nav>

      <div className="login-card">
        <div className="login-brand">
          <div className="brand-logo">
            <img src={logo} alt="TaskMaster Logo" width="100" height="100" />
          </div>
          <h1>Selamat Datang</h1>
          <p>Masuk untuk mengatur tugasmu</p>
        </div>

        {msg && <div className="alert-error">{msg}</div>}

        <form onSubmit={handleLogin} className="form-auth">
          <div className="field-group">
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="field-group">
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-primary">Login</button>
        </form>

        <p className="footer-text">
          Belum punya akun? <Link to="/register">Daftar</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;