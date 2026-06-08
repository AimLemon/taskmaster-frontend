import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios'; // Import axios
import './RegisterPage.css';
import logo from '../assets/taskmastericon.png';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confPassword, setConfPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);
  const [msg, setMsg] = useState(''); // Untuk menampilkan pesan error
  const navigate = useNavigate();

  // Normalisasi URL API
  const API_URL = process.env.REACT_APP_API_URL?.replace(/\/$/, "");

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validasi Format Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return setMsg("Format email tidak valid!");

    // Validasi Panjang Password
    if (password.length < 6) return setMsg("Password minimal harus 6 karakter!");

    try {
      // Menggunakan API_URL yang sudah dibersihkan
      await axios.post(`${API_URL}/users`, {
        name: name,
        email: email,
        password: password,
        confPassword: confPassword
      });
      // Jika berhasil, arahkan ke halaman Login
      navigate("/login");
    } catch (error) {
      if (error.response) {
        // Menampilkan pesan error dari backend (contoh: "Email sudah terdaftar")
        setMsg(error.response.data.msg);
      }
    }
  };

  return (
    <div className="register-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        <span>❮</span> Kembali
      </button>

      <div className="register-header">
        <div className="register-icon">
          <img src={logo} alt="TaskMaster Logo" width="60" height="60" />
        </div>
        <h1 className="register-title">Daftar Akun</h1>
        <p className="register-subtitle">Mulai atur tugas - tugasmu</p>
      </div>

      {/* Menampilkan Pesan Error jika ada */}
      {msg && <p className="error-message" style={{ color: 'red', textAlign: 'center' }}>{msg}</p>}

      <form className="register-form" onSubmit={handleRegister}>
        <div className="input-group">
          <span className="input-icon">👤</span>
          <input 
            type="text" 
            placeholder="Username" 
            value={name}
            style={{ paddingLeft: '45px' }}
            onChange={(e) => setName(e.target.value)}
            required 
          />
        </div>

        <div className="input-group">
          <span className="input-icon">✉</span>
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            style={{ paddingLeft: '45px' }}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>

        <div className="input-group">
          <span className="input-icon">🔑</span>
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Password (Min. 6 Karakter)" 
            value={password}
            style={{ paddingLeft: '45px' }}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          <span 
            className="eye-icon" 
            onClick={() => setShowPassword(!showPassword)}
            style={{ cursor: 'pointer' }}
          >
            {showPassword ? "🙈" : "👁"}
          </span>
        </div>

        <div className="input-group">
          <span className="input-icon">🔑</span>
          <input 
            type={showConfPassword ? "text" : "password"} 
            placeholder="Konfirmasi Password" 
            value={confPassword}
            style={{ paddingLeft: '45px' }}
            onChange={(e) => setConfPassword(e.target.value)}
            required 
          />
          <span 
            className="eye-icon" 
            onClick={() => setShowConfPassword(!showConfPassword)}
            style={{ cursor: 'pointer' }}
          >
            {showConfPassword ? "🙈" : "👁"}
          </span>
        </div>

        {/* Tombol diperbaiki teksnya menjadi "Daftar" agar tidak bingung */}
        <button type="submit" className="btn-register-submit">Daftar</button>
      </form>

      <p className="login-prompt">
        Sudah punya akun? <Link to="/login" className="login-link">Login</Link>
      </p>
    </div>
  );
};

export default RegisterPage;