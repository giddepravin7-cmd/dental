import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../../../styles/DentistList.css';

interface ServiceItem {
  category: string;
  service_name: string;
  fee: number;
}

interface Dentist {
  id: number;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  experience: number;
  clinic_name: string;
  clinic_address: string;
  fees: number;
  specialization: string;
  latitude: number;
  longitude: number;
  pincode?: string;
  profile_photo?: string;
  services_offered?: ServiceItem[];
}

const DentistList: React.FC = () => {
  const [dentists,        setDentists]        = useState<Dentist[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState("");
  const [pincodeFilter,   setPincodeFilter]   = useState("");
  const [addressFilter,   setAddressFilter]   = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError,   setLocationError]   = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDentists = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/dentists");
        setDentists(res.data);
      } catch {
        setError("Failed to load dentists. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchDentists();
  }, []);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocationLoading(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const addr = res.data.address;
          setPincodeFilter(addr.postcode || "");
          setAddressFilter(addr.city || addr.town || addr.village || addr.county || "");
        } catch {
          setLocationError("Could not fetch location details. Please enter manually.");
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationError("Location access denied. Please enter your details manually.");
        setLocationLoading(false);
      }
    );
  };

  const handleClearFilters = () => {
    setPincodeFilter("");
    setAddressFilter("");
    setLocationError("");
  };

  const filteredDentists = useMemo(() => {
    return dentists.filter((d) => {
      const addrLower = d.clinic_address.toLowerCase();
      const pinLower  = (d.pincode ?? "").toLowerCase();
      const matchesPincode =
        pincodeFilter.trim() === "" ||
        pinLower.includes(pincodeFilter.trim().toLowerCase()) ||
        addrLower.includes(pincodeFilter.trim().toLowerCase());
      const matchesAddress =
        addressFilter.trim() === "" ||
        addrLower.includes(addressFilter.trim().toLowerCase());
      return matchesPincode && matchesAddress;
    });
  }, [dentists, pincodeFilter, addressFilter]);

  if (loading) return <div className="dentist-list-container"><p>Loading dentists...</p></div>;
  if (error)   return <div className="dentist-list-container"><p className="error-msg">{error}</p></div>;

  return (
    <div className="dentist-list-container">
      <h1 className="dentist-list-title">Find Nearby Clinics</h1>

      {/* ─── Filter Section ─── */}
      <div className="filter-section">
        <h2 className="filter-title">🔍 Find Nearby Clinics</h2>
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label" htmlFor="pincode-input">📮 Pin Code / Zip Code</label>
            <input
              id="pincode-input"
              className="filter-input"
              type="text"
              placeholder="e.g. 400001"
              value={pincodeFilter}
              maxLength={10}
              onChange={(e) => setPincodeFilter(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label" htmlFor="address-input">📍 Area / City / Address</label>
            <input
              id="address-input"
              className="filter-input"
              type="text"
              placeholder="e.g. Andheri, Mumbai"
              value={addressFilter}
              onChange={(e) => setAddressFilter(e.target.value)}
            />
          </div>
        </div>
        <div className="filter-actions">
          <button className="location-btn" onClick={handleUseMyLocation} disabled={locationLoading}>
            {locationLoading ? "Detecting..." : "📡 Use My Location"}
          </button>
          {(pincodeFilter || addressFilter) && (
            <button className="clear-btn" onClick={handleClearFilters}>✕ Clear Filters</button>
          )}
        </div>
        {locationError && <p className="location-error">{locationError}</p>}
        {(pincodeFilter || addressFilter) && (
          <p className="filter-results-info">
            Showing <strong>{filteredDentists.length}</strong> clinic{filteredDentists.length !== 1 ? "s" : ""} near{" "}
            <strong>{[addressFilter, pincodeFilter].filter(Boolean).join(" – ")}</strong>
          </p>
        )}
      </div>

      {/* ─── Cards ─── */}
      {filteredDentists.length === 0 ? (
        <div className="no-dentists-wrapper">
          <p className="no-dentists">
            {dentists.length === 0
              ? "No approved dentists available at the moment."
              : "No clinics found for your search. Try a different pin code or area."}
          </p>
          {dentists.length > 0 && (
            <button className="clear-btn" onClick={handleClearFilters}>Show All Dentists</button>
          )}
        </div>
      ) : (
        <div className="dentist-cards">
          {filteredDentists.map((d) => {
            const photoUrl = d.profile_photo
              ? `http://localhost:5000${d.profile_photo}`
              : null;
            const offeredCount = (d.services_offered ?? []).filter((s) => s.fee > 0).length;

            return (
              <div
                key={d.id}
                className="dentist-card dentist-card--clickable"
                onClick={() => navigate(`/dentists/${d.id}`)}
              >
                {/* ── Top: Photo + Name ── */}
                <div className="dentist-card-top">
                  <div className="dentist-avatar">
                    {photoUrl ? (
                      <img src={photoUrl} alt={`Dr. ${d.name}`} className="dentist-avatar-img" />
                    ) : (
                      <div className="dentist-avatar-fallback">
                        {d.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="dentist-card-header">
                    <h3 className="dentist-name">Dr. {d.name}</h3>
                    <span className="dentist-specialization-badge">{d.specialization}</span>
                    <p className="dentist-qualification-sub">
                      {d.qualification} · {d.experience} yrs exp
                    </p>
                  </div>
                </div>

                {/* ── Core Info ── */}
                <div className="dentist-card-body">
                  <p className="dentist-info"><span>🏥</span> {d.clinic_name}</p>
                  <p className="dentist-info"><span>📍</span> {d.clinic_address}</p>
                  {d.pincode && <p className="dentist-info"><span>📮</span> Pin: {d.pincode}</p>}
                  <p className="dentist-info"><span>📞</span> {d.phone}</p>
                  <p className="dentist-fees">
                    <span></span> Base fee: <strong>₹{d.fees}</strong> per visit
                  </p>
                  {offeredCount > 0 && (
                    <p className="dentist-services-hint"> {offeredCount} services available — click to view</p>
                  )}
                </div>

                {/* ── Buttons — stop propagation so they don't trigger card click ── */}
                <div className="dentist-card-buttons">
                  <button
                    className="book-btn"
                    onClick={(e) => { e.stopPropagation(); navigate(`/dentists/${d.id}`); }}
                  >
                    Book Appointment
                  </button>
                  <button
                    className="call-btn"
                    onClick={(e) => { e.stopPropagation(); window.open(`tel:${d.phone}`); }}
                  >
                    Call Clinic
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DentistList;