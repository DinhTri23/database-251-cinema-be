import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-5 mt-auto">
      <div className="container">
        <div className="row">
          {/* Cột 1: Thông tin chung */}
          <div className="col-md-4 mb-3">
            <h5>My Cinema</h5>
            <p className="text-muted">
              Trải nghiệm điện ảnh tuyệt vời nhất với hệ thống âm thanh vòm và màn hình IMAX sắc nét.
            </p>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <div className="col-md-4 mb-3">
            <h5>Liên kết</h5>
            <ul className="list-unstyled">
              <li><a href="#" className="text-decoration-none text-muted">Về chúng tôi</a></li>
              <li><a href="#" className="text-decoration-none text-muted">Thỏa thuận sử dụng</a></li>
              <li><a href="#" className="text-decoration-none text-muted">Quy chế hoạt động</a></li>
            </ul>
          </div>

          {/* Cột 3: Liên hệ */}
          <div className="col-md-4 mb-3">
            <h5>Liên hệ</h5>
            <p className="text-muted mb-1">📞 Hotline: 1900 1234</p>
            <p className="text-muted">📧 Email: support@mycinema.com</p>
          </div>
        </div>

        <hr className="bg-secondary" />
        
        {/* Dòng bản quyền */}
        <div className="text-center text-muted">
          &copy; 2025 My Cinema. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;