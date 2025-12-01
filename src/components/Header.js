import React from 'react';
import { NavLink } from 'react-router-dom';

const Header = () => {
  const linkClass = ({ isActive }) => `nav-link px-3 ${isActive ? "active-nav" : ""}`;

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <style>{`
            .active-nav {
              border-bottom: 2px solid #ffc107;
              color: #ffffff !important;
              font-weight: 700;
            }
          `}</style>
          {/* Logo / Brand */}
          <NavLink className="navbar-brand" to="/">
            🎬 My Cinema
          </NavLink>

          {/* Nút Toggle cho mobile */}
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav" 
            aria-controls="navbarNav" 
            aria-expanded="false" 
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Danh sách Menu */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto"> {/* ms-auto đẩy menu sang phải */}
              <li className="nav-item">
                <NavLink className="nav-link" to="/movies">Phim đang chiếu</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/branches">Chi nhánh</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/revenue-report">Báo cáo doanh thu</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/ticket-lookup">Tra cứu vé</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/customer-spending">Tra cứu chi tiêu</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/movie-rating">Đánh giá phim</NavLink>
              </li>
            </ul>
          
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;