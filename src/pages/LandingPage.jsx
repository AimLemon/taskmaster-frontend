import React from 'react';
import './LandingPage.css';
import { Link } from 'react-router-dom';
import logo from '../assets/taskmastericon.png';

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Icon Jam/Tugas sesuai desain */}
      <img src={logo} alt="TaskMaster Logo" className="landing-icon-img" style={{ width: '100px', marginBottom: '20px' }} />
      
      <h1 className="landing-title">TaskMaster</h1>
      
      <p className="landing-description">
        Kelola tugas, rencana, atur prioritas, dan jangan biarkan deadline menghambat prestasi dan tujuanmu. Sederhana, cepat dan terorganisir.
      </p>
      
      <div className="landing-divider"></div>

      <div className="button-group">
        <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          Masuk ke Akun
        </Link>
        
        <Link to="/register" className="btn btn-register">Daftar Sekarang</Link>
      </div>

      <p className="footer-text">UNTUK ORANG-ORANG PRODUKTIF</p>
    </div>
  );
};

export default LandingPage;