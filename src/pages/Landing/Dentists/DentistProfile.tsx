import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import '../../../styles/Dentists.css';

interface ServiceItem {
  category: string;
  service_name: string;
  fee: number;
}

interface ClinicImage {
  id: number;
  image_url: string;
  caption?: string;
}

interface Testimonial {
  id: number;
  video_url: string;
  patient_name: string;
  thumbnail_url?: string;
  description?: string;
}

interface Review {
  id: number;
  patient_name: string;
  rating: number;
  comment: string;
  created_at: string;
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

interface SlotItem {
  id: number;
  slot_date: string;
  slot_time: string;
  is_available: boolean;
}

const SERVICE_ICONS: Record<string, string> = {
  "General Dentistry":                "",
  "Cosmetic Dentistry":               "",
  "Orthodontics":                     "",
  "Endodontics":                      "",
  "Periodontics":                     "",
  "Prosthodontics":                   "",
  "Pediatric Dentistry":              "",
  "Oral & Maxillofacial Surgery":     "",
  "Preventive & Diagnostic Services": "",
};

const groupByCategory = (services: ServiceItem[]) =>
  services.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, ServiceItem[]>);

const StarRating: React.FC<{ rating: number; interactive?: boolean; onRate?: (r: number) => void }> = ({
  rating, interactive = false, onRate
}) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= (hovered || rating) ? "star--filled" : ""} ${interactive ? "star--interactive" : ""}`}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate?.(star)}
        >★</span>
      ))}
    </div>
  );
};

const DentistProfile: React.FC = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [dentist,         setDentist]         = useState<Dentist | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [notes,           setNotes]           = useState("");
  const [booking,         setBooking]         = useState(false);
  const [message,         setMessage]         = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [activeTab,       setActiveTab]       = useState<"info" | "services" | "gallery" | "testimonials" | "reviews" | "book">("info");

  // Gallery
  const [clinicImages,    setClinicImages]    = useState<ClinicImage[]>([]);
  const [lightboxIdx,     setLightboxIdx]     = useState<number | null>(null);

  // Testimonials
  const [testimonials,    setTestimonials]    = useState<Testimonial[]>([]);
  const [activeVideo,     setActiveVideo]     = useState<number | null>(null);
  const [availableSlots, setAvailableSlots] = useState<SlotItem[]>([]);
  const [slotsLoading,   setSlotsLoading]   = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  // Reviews
  const [reviews,         setReviews]         = useState<Review[]>([]);
  const [avgRating,       setAvgRating]       = useState(0);
  const [reviewForm,      setReviewForm]      = useState({ rating: 0, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage,   setReviewMessage]   = useState<{ text: string; type: "success" | "error" } | null>(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dentistRes, imagesRes, testimonialsRes, reviewsRes, slotsRes] = await Promise.allSettled([
          axios.get(`http://localhost:5000/api/dentists/${id}`),
          axios.get(`http://localhost:5000/api/dentists/${id}/images`),
          axios.get(`http://localhost:5000/api/dentists/${id}/testimonials`),
          axios.get(`http://localhost:5000/api/dentists/${id}/reviews`),
          axios.get(`http://localhost:5000/api/dentists/${id}/slots`),
        ]);

        if (dentistRes.status === "fulfilled") setDentist(dentistRes.value.data);
        if (imagesRes.status === "fulfilled") setClinicImages(imagesRes.value.data);
        if (testimonialsRes.status === "fulfilled") setTestimonials(testimonialsRes.value.data);
        if (reviewsRes.status === "fulfilled") {
          const revData = reviewsRes.value.data;
          setReviews(revData.reviews || []);
          setAvgRating(revData.average_rating || 0);
        }
        if (slotsRes.status === "fulfilled") setAvailableSlots(slotsRes.value.data);
      } catch (error) {
        console.error("Error fetching dentist:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  // Lightbox keyboard nav
  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setLightboxIdx((i) => i !== null ? Math.min(i + 1, clinicImages.length - 1) : null);
      if (e.key === "ArrowLeft")  setLightboxIdx((i) => i !== null ? Math.max(i - 1, 0) : null);
      if (e.key === "Escape")     setLightboxIdx(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIdx, clinicImages.length]);

  
const handleBooking = async () => {
  const token = localStorage.getItem("token");
  if (!token) { navigate("/login"); return; }

  if (!selectedSlotId) {
    setMessage({ text: "Please select an available slot.", type: "error" });
    return;
  }

  const selected = availableSlots.find((s) => s.id === selectedSlotId);
  if (!selected) return;

  setBooking(true);
  setMessage(null);
  try {
    const res = await axios.post(
      "http://localhost:5000/api/appointments",
      {
        dentist_id:       Number(id),
        appointment_date: selected.slot_date.slice(0, 10),
        appointment_time: selected.slot_time,
        slot_id:          selected.id,
        notes:            notes.trim() || undefined,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setMessage({ text: res.data.message, type: "success" });
    setSelectedSlotId(null);
    setNotes("");
    // Remove booked slot from UI
    setAvailableSlots((prev) => prev.filter((s) => s.id !== selectedSlotId));
  } catch (error: any) {
    setMessage({ text: error.response?.data?.message || "Server error. Please try again.", type: "error" });
  } finally {
    setBooking(false);
  }
};

  const handleReviewSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    if (!reviewForm.rating || !reviewForm.comment.trim()) {
      setReviewMessage({ text: "Please provide a rating and comment.", type: "error" });
      return;
    }
    setSubmittingReview(true);
    setReviewMessage(null);
    try {
      await axios.post(
        `http://localhost:5000/api/dentists/${id}/reviews`,
        reviewForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviewMessage({ text: "Review submitted successfully!", type: "success" });
      setReviewForm({ rating: 0, comment: "" });
      // Refresh reviews
      const res = await axios.get(`http://localhost:5000/api/dentists/${id}/reviews`);
      setReviews(res.data.reviews || []);
      setAvgRating(res.data.average_rating || 0);
    } catch (error: any) {
      setReviewMessage({ text: error.response?.data?.message || "Failed to submit review.", type: "error" });
    } finally {
      setSubmittingReview(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="dentist-profile-container">
        <div className="profile-loading">
          <div className="profile-spinner" />
          <p>Loading clinic details...</p>
        </div>
      </div>
    );
  }

  if (!dentist) {
    return (
      <div className="dentist-profile-container">
        <div className="profile-error">
          <p>Dentist not found.</p>
          <button onClick={() => navigate("/dentists")}>← Back to Dentists</button>
        </div>
      </div>
    );
  }

  const photoUrl     = dentist.profile_photo ? `http://localhost:5000${dentist.profile_photo}` : null;
  const offeredSvcs  = (dentist.services_offered ?? []).filter((s) => s.fee > 0);
  const groupedSvcs  = groupByCategory(offeredSvcs);
  const mapsUrl      = dentist.latitude && dentist.longitude
    ? `https://www.google.com/maps?q=${dentist.latitude},${dentist.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dentist.clinic_address)}`;

  const ratingBars = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  return (
    <div className="dentist-profile-container">

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div className="lightbox-overlay" onClick={() => setLightboxIdx(null)}>
          <button className="lightbox-close" onClick={() => setLightboxIdx(null)}>✕</button>
          <button className="lightbox-nav lightbox-nav--prev"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx(Math.max(lightboxIdx - 1, 0)); }}
            disabled={lightboxIdx === 0}>‹</button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={`http://localhost:5000${clinicImages[lightboxIdx].image_url}`} alt="" />
            {clinicImages[lightboxIdx].caption && (
              <p className="lightbox-caption">{clinicImages[lightboxIdx].caption}</p>
            )}
            <span className="lightbox-counter">{lightboxIdx + 1} / {clinicImages.length}</span>
          </div>
          <button className="lightbox-nav lightbox-nav--next"
            onClick={(e) => { e.stopPropagation(); setLightboxIdx(Math.min(lightboxIdx + 1, clinicImages.length - 1)); }}
            disabled={lightboxIdx === clinicImages.length - 1}>›</button>
        </div>
      )}

      <button className="profile-back-btn" onClick={() => navigate(-1)}>← Back to Dentists</button>

      {/* ── HERO ── */}
      <div className="profile-hero">
        <div className="profile-hero-photo">
          {photoUrl ? (
            <img src={photoUrl} alt={`Dr. ${dentist.name}`} className="profile-photo-img" />
          ) : (
            <div className="profile-photo-fallback">{dentist.name.charAt(0).toUpperCase()}</div>
          )}
        </div>

        <div className="profile-hero-info">
          <h1 className="profile-doctor-name">Dr. {dentist.name}</h1>
          <span className="profile-specialization-badge">{dentist.specialization}</span>

          {/* Rating summary in hero */}
          {reviews.length > 0 && (
            <div className="profile-hero-rating">
              <StarRating rating={Math.round(avgRating)} />
              <span className="profile-hero-rating-text">{avgRating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
            </div>
          )}

          <div className="profile-meta-row">
            <span className="profile-meta-chip"> {dentist.qualification}</span>
            <span className="profile-meta-chip"> {dentist.experience} yrs experience</span>
            <span className="profile-meta-chip"> ₹{dentist.fees} base fee</span>
          </div>

          <div className="profile-contact-row">
            <a href={`tel:${dentist.phone}`} className="profile-contact-btn profile-contact-btn--call">📞 {dentist.phone}</a>
            <a href={`mailto:${dentist.email}`} className="profile-contact-btn profile-contact-btn--email">✉ {dentist.email}</a>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="profile-tabs">
        <button className={`profile-tab ${activeTab === "info" ? "profile-tab--active" : ""}`} onClick={() => setActiveTab("info")}>
           Clinic Info
        </button>
        {offeredSvcs.length > 0 && (
          <button className={`profile-tab ${activeTab === "services" ? "profile-tab--active" : ""}`} onClick={() => setActiveTab("services")}>
             Services & Fees
            <span className="profile-tab-badge">{offeredSvcs.length}</span>
          </button>
        )}
        <button className={`profile-tab ${activeTab === "gallery" ? "profile-tab--active" : ""}`} onClick={() => setActiveTab("gallery")}>
           Gallery
          {clinicImages.length > 0 && <span className="profile-tab-badge">{clinicImages.length}</span>}
        </button>
        <button className={`profile-tab ${activeTab === "testimonials" ? "profile-tab--active" : ""}`} onClick={() => setActiveTab("testimonials")}>
           Testimonials
          {testimonials.length > 0 && <span className="profile-tab-badge">{testimonials.length}</span>}
        </button>
        <button className={`profile-tab ${activeTab === "reviews" ? "profile-tab--active" : ""}`} onClick={() => setActiveTab("reviews")}>
           Reviews
          {reviews.length > 0 && <span className="profile-tab-badge">{reviews.length}</span>}
        </button>
        <button className={`profile-tab profile-tab--book ${activeTab === "book" ? "profile-tab--active" : ""}`} onClick={() => setActiveTab("book")}>
           Book Appointment
        </button>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="profile-tab-content">

        {/* ── Clinic Info ── */}
        {activeTab === "info" && (
          <div className="profile-section-card">
            <h2 className="profile-section-title"> Clinic Information</h2>
            <div className="profile-info-grid">
              <div className="profile-info-item"><label>Clinic Name</label><span>{dentist.clinic_name}</span></div>
              <div className="profile-info-item"><label>Address</label><span>{dentist.clinic_address}</span></div>
              {dentist.pincode && <div className="profile-info-item"><label>Pin Code</label><span>{dentist.pincode}</span></div>}
              <div className="profile-info-item"><label>Qualification</label><span>{dentist.qualification}</span></div>
              <div className="profile-info-item"><label>Experience</label><span>{dentist.experience} years</span></div>
              <div className="profile-info-item"><label>Base Consultation Fee</label><span className="profile-fee-highlight">₹{dentist.fees} per visit</span></div>
              <div className="profile-info-item"><label>Phone</label><span>{dentist.phone}</span></div>
              <div className="profile-info-item"><label>Email</label><span>{dentist.email}</span></div>
            </div>
            <div className="profile-action-row">
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="profile-map-btn">📍 View on Google Maps</a>
              <button className="profile-goto-book-btn" onClick={() => setActiveTab("book")}>📅 Book an Appointment →</button>
            </div>
          </div>
        )}

        {/* ── Services & Fees ── */}
        {activeTab === "services" && offeredSvcs.length > 0 && (
          <div className="profile-section-card">
            <h2 className="profile-section-title"> Services & Fees</h2>
            <div className="profile-services-grid">
              {Object.entries(groupedSvcs).map(([category, items]) => (
                <div key={category} className="profile-service-category">
                  <div className="profile-service-category-header">
                    <span className="profile-service-icon">{SERVICE_ICONS[category] || ""}</span>
                    <h3 className="profile-service-category-title">{category}</h3>
                  </div>
                  <div className="profile-service-list">
                    {items.map((s) => (
                      <div key={s.service_name} className="profile-service-row">
                        <span className="profile-service-name">{s.service_name}</span>
                        <span className="profile-service-fee">₹{s.fee}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button className="profile-goto-book-btn" onClick={() => setActiveTab("book")}>📅 Book an Appointment →</button>
          </div>
        )}

        {/* ── Gallery ── */}
        {activeTab === "gallery" && (
          <div className="profile-section-card">
            <h2 className="profile-section-title"> Clinic Gallery</h2>
            {clinicImages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"></div>
                <p>No clinic photos uploaded yet.</p>
              </div>
            ) : (
              <div className="gallery-grid">
                {clinicImages.map((img, idx) => (
                  <div key={img.id} className="gallery-item" onClick={() => setLightboxIdx(idx)}>
                    <img src={`http://localhost:5000${img.image_url}`} alt={img.caption || `Clinic photo ${idx + 1}`} />
                    <div className="gallery-item-overlay">
                      <span className="gallery-zoom-icon">🔍</span>
                    </div>
                    {img.caption && <p className="gallery-caption">{img.caption}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Testimonials ── */}
        {activeTab === "testimonials" && (
          <div className="profile-section-card">
            <h2 className="profile-section-title"> Patient Testimonials</h2>
            {testimonials.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"></div>
                <p>No video testimonials yet.</p>
              </div>
            ) : (
              <div className="testimonials-grid">
                {testimonials.map((t) => (
                  <div key={t.id} className={`testimonial-card ${activeVideo === t.id ? "testimonial-card--active" : ""}`}>
                    {activeVideo === t.id ? (
                      <div className="testimonial-video-wrapper">
                        <video
                          src={`http://localhost:5000${t.video_url}`}
                          controls
                          autoPlay
                          className="testimonial-video"
                        />
                        <button className="testimonial-close-btn" onClick={() => setActiveVideo(null)}>✕ Close</button>
                      </div>
                    ) : (
                      <div className="testimonial-thumbnail" onClick={() => setActiveVideo(t.id)}>
                        {t.thumbnail_url ? (
                          <img src={`http://localhost:5000${t.thumbnail_url}`} alt={t.patient_name} />
                        ) : (
                          <div className="testimonial-thumbnail-placeholder"></div>
                        )}
                        <div className="testimonial-play-btn">▶</div>
                      </div>
                    )}
                    <div className="testimonial-info">
                      <h4 className="testimonial-patient-name">{t.patient_name}</h4>
                      {t.description && <p className="testimonial-description">{t.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Reviews ── */}
        {activeTab === "reviews" && (
          <div className="profile-section-card">
            <h2 className="profile-section-title"> Patient Reviews</h2>

            {/* Rating Summary */}
            {reviews.length > 0 && (
              <div className="reviews-summary">
                <div className="reviews-summary-left">
                  <div className="reviews-avg-score">{avgRating.toFixed(1)}</div>
                  <StarRating rating={Math.round(avgRating)} />
                  <p className="reviews-total">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="reviews-bars">
                  {ratingBars.map(({ star, count, pct }) => (
                    <div key={star} className="reviews-bar-row">
                      <span className="reviews-bar-label">{star}★</span>
                      <div className="reviews-bar-track">
                        <div className="reviews-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="reviews-bar-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Write a Review */}
            <div className="review-form-section">
              <h3 className="review-form-title">Write a Review</h3>
              {reviewMessage && (
                <div className={`booking-message booking-message--${reviewMessage.type}`}>
                  {reviewMessage.type === "success" ? "✅" : "❌"} {reviewMessage.text}
                </div>
              )}
              <div className="review-form">
                <div className="form-group">
                  <label>Your Rating *</label>
                  <StarRating rating={reviewForm.rating} interactive onRate={(r) => setReviewForm({ ...reviewForm, rating: r })} />
                </div>
                <div className="form-group">
                  <label>Your Review *</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Share your experience with Dr. {dentist.name}..."
                    rows={4}
                  />
                </div>
                <button className="submit-review-btn" onClick={handleReviewSubmit} disabled={submittingReview}>
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>

            {/* Review List */}
            {reviews.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">💬</div>
                <p>No reviews yet. Be the first to share your experience!</p>
              </div>
            ) : (
              <div className="reviews-list">
                {reviews.map((r) => (
                  <div key={r.id} className="review-card">
                    <div className="review-card-header">
                      <div className="review-avatar">{r.patient_name.charAt(0).toUpperCase()}</div>
                      <div className="review-meta">
                        <span className="review-patient-name">{r.patient_name}</span>
                        <span className="review-date">{new Date(r.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
                      </div>
                      <StarRating rating={r.rating} />
                    </div>
                    <p className="review-comment">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Book Appointment ── */}
     {activeTab === "book" && (
  <div className="profile-section-card">
    <h2 className="profile-section-title">📅 Book an Appointment</h2>
    <p className="profile-book-subtitle">
      with <strong>Dr. {dentist.name}</strong> at {dentist.clinic_name}
    </p>

    {message && (
      <div className={`booking-message booking-message--${message.type}`}>
        {message.type === "success" ? "✅" : "❌"} {message.text}
      </div>
    )}

    {availableSlots.length === 0 ? (
      <div className="empty-state">
        <div className="empty-state-icon">🕐</div>
        <p>No available slots at the moment. Please check back later.</p>
      </div>
    ) : (
      <>
        {/* Group slots by date */}
        {(() => {
          const grouped = availableSlots.reduce((acc, slot) => {
            if (!acc[slot.slot_date]) acc[slot.slot_date] = [];
            acc[slot.slot_date].push(slot);
            return acc;
          }, {} as Record<string, SlotItem[]>);

          return Object.entries(grouped).map(([date, daySlots]) => (
            <div key={date} className="slot-date-group">
              <h4 className="slot-date-heading">
                📅 {new Date(date).toLocaleDateString("en-IN", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric"
                })}
              </h4>
              <div className="slot-picker-grid">
                {daySlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    className={`time-slot-btn ${selectedSlotId === slot.id ? "time-slot-btn--active" : ""}`}
                    onClick={() => setSelectedSlotId(slot.id)}
                  >
                    🕐 {slot.slot_time.slice(0, 5)}
                  </button>
                ))}
              </div>
            </div>
          ));
        })()}

        {selectedSlotId && (() => {
          const s = availableSlots.find((s) => s.id === selectedSlotId)!;
          return (
            <p className="time-slot-selected">
              ✅ Selected: <strong>
                {new Date(s.slot_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                {" · "}{s.slot_time.slice(0, 5)}
              </strong>
            </p>
          );
        })()}

        <div className="form-group" style={{ marginTop: "20px" }}>
          <label>Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any symptoms or concerns..."
            rows={3}
          />
        </div>

        <div className="profile-fee-summary">
          <div className="profile-fee-summary-left">
            <span className="profile-fee-label">Consultation Fee</span>
            {selectedSlotId && (() => {
              const s = availableSlots.find((s) => s.id === selectedSlotId)!;
              return (
                <span className="profile-fee-detail">
                  {new Date(s.slot_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                  {" · "}{s.slot_time.slice(0, 5)}
                </span>
              );
            })()}
          </div>
          <span className="profile-fee-amount">₹{dentist.fees}</span>
        </div>

        <button
          className="book-now-btn"
          onClick={handleBooking}
          disabled={booking || !selectedSlotId}
        >
          {booking ? "Booking..." : "Confirm Booking"}
        </button>
      </>
    )}
  </div>
)}
      </div>
    </div>
  );
};

export default DentistProfile;