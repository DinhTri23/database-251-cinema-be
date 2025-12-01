import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          {/* Logo / Brand */}
          <Link className="navbar-brand" to="/">
            🎬 My Cinema
          </Link>

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
                <Link className="nav-link active" to="/">Trang chủ</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/movies">Phim đang chiếu</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/branches">Chi nhánh</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/revenue-report">Báo cáo doanh thu</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/ticket-lookup">Tra cứu vé</Link>
              </li>
            </ul>
            
            {/* Nút Đăng nhập/Đăng ký */}
            <div className="d-flex ms-3">
                <button className="btn btn-outline-warning btn-sm">Đăng nhập</button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;