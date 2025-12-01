import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import RevenueReport from "../pages/RevenueReport/RevenueReport.js";
import TicketLookup from "../pages/TicketLookup/TicketLookup";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MoviePage from "../pages/MoviePage";
import BranchPage from "../pages/BranchPage.js";

const AppRoutes = () => {
  return (
    <Router>
      {/* Bao bọc toàn bộ bằng div này để Footer luôn ở đáy */}
      <div className="d-flex flex-column min-vh-100">
        
        <Header />

        {/* Nội dung chính sẽ giãn ra để lấp đầy khoảng trống (flex-grow-1) */}
        <div className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<MoviePage />} />
            <Route path="/revenue-report" element={<RevenueReport />} />
            <Route path="/ticket-lookup" element={<TicketLookup />} />
            <Route path="/branches" element={<BranchPage />} />
            {/* Các route khác... */}
          </Routes>
        </div>

        <Footer />
        
      </div>
    </Router>
  );
};

export default AppRoutes;