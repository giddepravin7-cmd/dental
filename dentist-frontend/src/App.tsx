import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./pages/Landing/Landing";
import Login from "./pages/Landing/Login/Login";
import Register from "./pages/Landing/Register/Register";
import Dashboard from "./pages/Landing/Dashboard/Dashboard";
import DentistList from "./pages/Landing/Dentists/DentistList";
import DentistProfile from "./pages/Landing/Dentists/DentistProfile";
import MyAppointments from "./pages/Landing/Appointments/MyAppointments";
import AdminDashboard from "./pages/Landing/Admin/AdminDashboard";
import AdminDentists  from "./pages/Landing/Admin/AdminDentists";
import AdminUsers     from "./pages/Landing/Admin/AdminUsers";
import DentistDashboard from "./pages/Landing/Dashboard/Dentistdashboard";
import AboutUs from "./pages/Landing/About";
import FAQ       from "./pages/Landing/Faq";
import ContactUs from "./pages/Landing/Contactus";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dentists" element={<DentistList />} />
            <Route path="/dentists/:id" element={<DentistProfile />} /> {/* Next step */}
            <Route path="/my-appointments" element={<MyAppointments />} />
            <Route path="/admin"          element={<AdminDashboard />} />
            <Route path="/admin/dentists" element={<AdminDentists />} />
            <Route path="/admin/users"    element={<AdminUsers />} />
            <Route path="/dentist/dashboard" element={<DentistDashboard />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/faq"     element={<FAQ />} />
            <Route path="/contact" element={<ContactUs />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
