import React from "react";

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-5 mt-auto">
      <div className="container">
        <div className="row text-center text-md-start">

          {/* Cột 1: Tên đồ án + Thành viên */}
          <div className="col-md-4 mb-3">
            <h5 className="fw-bold mb-3">📘 Bài tập lớn 2</h5>

            <p className="text-light">
              Website mô phỏng hệ thống quản lý rạp chiếu phim.
            </p>

            {/* Thành viên nhóm */}
            <h6 className="fw-bold mt-3 mb-2 text-light">👥 Thành viên nhóm:</h6>

            <ul className="list-unstyled">
              <li className="text-light">• Nguyễn Chí Nhân – 2312430</li>
              <li className="text-light">• Trần Đăng Khoa – 2311643</li>
              <li className="text-light">• Nguyễn Đức Toàn – 2313485</li>
              <li className="text-light">• Võ Đình Trí – 2313632</li>
              <li className="text-light">• Phạm Quang Thành – 2313138</li>
            </ul>
          </div>



          {/* Cột 2: Thông tin nhóm */}
          <div className="col-md-4 mb-3">
            <h5 className="fw-bold mb-3">Thông tin nhóm</h5>
            <p className="mb-1"><strong>Nhóm:</strong> 2</p>
            <p className="mb-1"><strong>Lớp:</strong> L02</p>
            <p className="mb-1"><strong>Môn học:</strong> Hệ cơ sở dữ liệu</p>
          </div>

          {/* Cột 3: Giảng viên */}
          <div className="col-md-4 mb-3">
            <h5 className="fw-bold mb-3">Giảng viên hướng dẫn</h5>
            <p className="mb-1">Trần Thị Quế Nguyệt</p>
            <p className="mb-1">
              Qua môn này nhóm em đã học được rất nhiều về cách thiết kế database cũng như làm giao diện website cơ bản. 
            </p>
            <p className="mb-1">
              Xin chân thành cảm ơn cô đã hướng dẫn và hỗ trợ nhóm trong quá trình thực hiện!
            </p>
          </div>
          <div className="mb-3 text-center">
            <h5 className="fw-bold mb-3">
              Ước gì cô cho 10 điểm hihi ò_Ó
            </h5>
          </div>
        </div>

        <hr className="bg-secondary" />

        <div className="text-center mt-3">
          © 2025 – Sản phẩm phục vụ học tập, không dùng cho mục đích thương mại. 
        </div>
      </div>
    </footer>
  );
};

export default Footer;
