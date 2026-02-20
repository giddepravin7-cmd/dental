import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing/Landing";
import Login from "./pages/Landing/Login/Login";
import Register from "./pages/Landing/Register/Register";
import Dashboard from "./pages/Landing/Dashboard/Dashboard";
import DentistList from "./pages/Landing/Dentists/DentistList";
import DentistProfile from "./pages/Landing/Dentists/DentistProfile";
import MyAppointments from "./pages/Landing/Appointments/MyAppointments";
import AdminDashboard from "./pages/Landing/Admin/AdminDashboard";
import AdminDentists from "./pages/Landing/Admin/AdminDentists";
import AdminUsers from "./pages/Landing/Admin/AdminUsers";
import DentistDashboard from "./pages/Landing/Dashboard/Dentistdashboard";
import AboutUs from "./pages/Landing/About";
import FAQ from "./pages/Landing/Faq";
import ContactUs from "./pages/Landing/Contactus";
import MoneyBack from "./pages/Landing/Moneyback";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow">
          <Routes>

            {/* ── Public ── */}
            <Route path="/"         element={<Landing />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about"    element={<AboutUs />} />
            <Route path="/faq"      element={<FAQ />} />
            <Route path="/contact"  element={<ContactUs />} />
            <Route path="/money-back" element={<MoneyBack />} />

            {/* ── Patient only ── */}
            <Route path="/dentists" element={
              <ProtectedRoute roles={["PATIENT"]}>
                <DentistList />
              </ProtectedRoute>
            } />
            <Route path="/dentists/:id" element={
              <ProtectedRoute roles={["PATIENT"]}>
                <DentistProfile />
              </ProtectedRoute>
            } />
            <Route path="/my-appointments" element={
              <ProtectedRoute roles={["PATIENT"]}>
                <MyAppointments />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute roles={["PATIENT"]}>
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* ── Dentist only ── */}
            <Route path="/dentist/dashboard" element={
              <ProtectedRoute roles={["DENTIST"]}>
                <DentistDashboard />
              </ProtectedRoute>
            } />

            {/* ── Admin only ── */}
            <Route path="/admin" element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/dentists" element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminDentists />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminUsers />
              </ProtectedRoute>
            } />

          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;