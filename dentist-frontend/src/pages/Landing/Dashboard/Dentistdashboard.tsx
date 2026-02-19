import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../../../styles/Dentistdashboard.css';

/* ─── Service catalogue ─── */
export const SERVICE_CATALOGUE = [
  { category: "General Dentistry",                services: ["Routine check-ups", "Dental cleaning (scaling & polishing)", "Fillings & cavity treatment", "Tooth extraction", "Preventive care"] },
  { category: "Cosmetic Dentistry",               services: ["Teeth whitening", "Veneers & laminates", "Smile makeovers", "Cosmetic bonding"] },
  { category: "Orthodontics",                     services: ["Braces (metal, ceramic, lingual)", "Invisalign / Clear aligners", "Retainers & jaw alignment"] },
  { category: "Endodontics",                      services: ["Root canal treatment", "Pulp therapy", "Endodontic surgery"] },
  { category: "Periodontics",                     services: ["Gum disease treatment", "Scaling and root planing", "Periodontal surgery"] },
  { category: "Prosthodontics",                   services: ["Crowns & bridges", "Dentures (complete/partial)", "Dental implants"] },
  { category: "Pediatric Dentistry",              services: ["Child dental care", "Fluoride treatment", "Habit counseling"] },
  { category: "Oral & Maxillofacial Surgery",     services: ["Wisdom tooth extraction", "Jaw surgery", "Oral pathology treatment"] },
  { category: "Preventive & Diagnostic Services", services: ["X-rays & 3D imaging", "Oral cancer screening", "Preventive sealants & fluoride treatment"] },
];

const SPECIALIZATIONS = SERVICE_CATALOGUE.map((c) => c.category);

interface ServiceItem  { category: string; service_name: string; fee: number; }
interface ClinicImage  { id: number; image_url: string; caption?: string; }
interface Testimonial  { id: number; video_url: string; patient_name: string; thumbnail_url?: string; description?: string; }

interface DentistProfile {
  id: number; name: string; email: string; phone: string;
  qualification: string; experience: number;
  clinic_name: string; clinic_address: string;
  fees: number; specialization: string;
  latitude: number; longitude: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  profile_photo?: string;
  services_offered?: ServiceItem[];
}

interface SlotItem {
  id: number;
  slot_date: string;
  slot_time: string;
  is_available: boolean;
  appointment_id?: number;
  appointment_status?: string;
  notes?: string;
  patient_name?: string;
  patient_email?: string;
  patient_phone?: string;
}

const STATUS_CONFIG = {
  PENDING:  { color: "status--pending",   icon: "", msg: "Your profile is under review by the admin." },
  APPROVED: { color: "status--confirmed", icon: "", msg: "Your profile is live and visible to patients." },
  REJECTED: { color: "status--cancelled", icon: "", msg: "Your profile was rejected. Update and resubmit." },
};

const buildEmptyServices = (): ServiceItem[] =>
  SERVICE_CATALOGUE.flatMap((cat) =>
    cat.services.map((s) => ({ category: cat.category, service_name: s, fee: 0 }))
  );

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════ */
const DentistDashboard: React.FC = () => {
  const [profile,        setProfile]        = useState<DentistProfile | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [isEditing,      setIsEditing]      = useState(false);
  const [message,        setMessage]        = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [photoPreview,   setPhotoPreview]   = useState<string | null>(null);
  const [photoFile,      setPhotoFile]      = useState<File | null>(null);
  const [services,       setServices]       = useState<ServiceItem[]>(buildEmptyServices());
  const [activeCategory, setActiveCategory] = useState<string>(SERVICE_CATALOGUE[0].category);

  // Active dashboard tab
const [activeTab, setActiveTab] = useState<"profile" | "gallery" | "testimonials" | "slots">("profile");
  // Time Slots
const [slots,          setSlots]          = useState<SlotItem[]>([]);
const [slotDate,       setSlotDate]       = useState("");
const [slotTime,       setSlotTime]       = useState("");
const [addingSlot,     setAddingSlot]     = useState(false);
const [slotMsg,        setSlotMsg]        = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Clinic images
  const [clinicImages,      setClinicImages]      = useState<ClinicImage[]>([]);
  const [uploadingImage,    setUploadingImage]    = useState(false);
  const [imageCaption,      setImageCaption]      = useState("");
  const [imageFile,         setImageFile]         = useState<File | null>(null);
  const [imagePreview,      setImagePreview]      = useState<string | null>(null);
  const [imageMsg,          setImageMsg]          = useState<{ text: string; type: "success" | "error" } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Testimonials
  const [testimonials,      setTestimonials]      = useState<Testimonial[]>([]);
  const [uploadingVideo,    setUploadingVideo]    = useState(false);
  const [videoFile,         setVideoFile]         = useState<File | null>(null);
  const [videoPatientName,  setVideoPatientName]  = useState("");
  const [videoDescription,  setVideoDescription]  = useState("");
  const [videoProgress,     setVideoProgress]     = useState(0);
  const [videoMsg,          setVideoMsg]          = useState<{ text: string; type: "success" | "error" } | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    qualification: "", experience: "", clinic_name: "",
    clinic_address: "", fees: "", specialization: SPECIALIZATIONS[0],
    latitude: "", longitude: "",
  });

  const navigate = useNavigate();
  const token    = localStorage.getItem("token");
  const user     = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!token || user.role !== "DENTIST") { navigate("/login"); return; }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/dentists/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data: DentistProfile = res.data;
    setProfile(data);
    setForm({
      qualification: data.qualification, experience: String(data.experience),
      clinic_name: data.clinic_name, clinic_address: data.clinic_address,
      fees: String(data.fees), specialization: data.specialization,
      latitude: String(data.latitude), longitude: String(data.longitude),
    });
    if (data.services_offered && data.services_offered.length > 0) {
      const saved = data.services_offered;
      setServices(buildEmptyServices().map((item) => {
        const found = saved.find((s) => s.category === item.category && s.service_name === item.service_name);
        return found ? { ...item, fee: found.fee } : item;
      }));
    }
    if (data.profile_photo) setPhotoPreview(`http://localhost:5000${data.profile_photo}`);

    // Fetch media
    await fetchMedia(data.id);
    await fetchSlots();
  } catch (err: any) {
    if (err.response?.status !== 404) console.error(err);
    setProfile(null);
  } finally {
    setLoading(false);
  }
};

  const fetchSlots = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/my-slots", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSlots(res.data);
  } catch (err) {
    console.error("Failed to fetch slots", err);
  }
};

  const fetchMedia = async (dentistId: number) => {
    try {
      const [imgRes, vidRes] = await Promise.allSettled([
        axios.get(`http://localhost:5000/api/dentists/${dentistId}/images`),
        axios.get(`http://localhost:5000/api/dentists/${dentistId}/testimonials`),
      ]);
      if (imgRes.status === "fulfilled") setClinicImages(imgRes.value.data);
      if (vidRes.status === "fulfilled") setTestimonials(vidRes.value.data);
    } catch (err) {
      console.error("Failed to fetch media", err);
    }
  };

  /* ── Form handlers ── */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };
  const handleServiceFeeChange = (category: string, service_name: string, fee: string) => {
    setServices((prev) =>
      prev.map((s) =>
        s.category === category && s.service_name === service_name ? { ...s, fee: Number(fee) || 0 } : s
      )
    );
  };

  const handleAddSlot = async () => {
  if (!slotDate || !slotTime) {
    setSlotMsg({ text: "Please select both a date and time.", type: "error" });
    return;
  }
  setAddingSlot(true); setSlotMsg(null);
  try {
    await axios.post(
      "http://localhost:5000/api/my-slots",
      { slot_date: slotDate, slot_time: slotTime },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setSlotMsg({ text: "Slot added successfully!", type: "success" });
    setSlotDate(""); setSlotTime("");
    await fetchSlots();
  } catch (err: any) {
    setSlotMsg({ text: err.response?.data?.message || "Failed to add slot.", type: "error" });
  } finally {
    setAddingSlot(false);
  }
};

const handleDeleteSlot = async (slotId: number) => {
  if (!window.confirm("Delete this slot?")) return;
  try {
    await axios.delete(`http://localhost:5000/api/my-slots/${slotId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
  } catch (err: any) {
    alert(err.response?.data?.message || "Failed to delete slot.");
  }
};

  /* ── Profile submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMessage(null);
    const offeredServices = services.filter((s) => s.fee > 0);
    const formData = new FormData();
    formData.append("qualification",    form.qualification);
    formData.append("experience",       form.experience);
    formData.append("clinic_name",      form.clinic_name);
    formData.append("clinic_address",   form.clinic_address);
    formData.append("fees",             form.fees);
    formData.append("specialization",   form.specialization);
    formData.append("latitude",         form.latitude || "0");
    formData.append("longitude",        form.longitude || "0");
    formData.append("services_offered", JSON.stringify(offeredServices));
    if (photoFile) formData.append("profile_photo", photoFile);
    try {
      if (profile) {
        await axios.put(`http://localhost:5000/api/dentists/${profile.id}`, formData,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
        setMessage({ text: "Profile updated successfully!", type: "success" });
        setIsEditing(false);
      } else {
        await axios.post("http://localhost:5000/api/dentists", formData,
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
        setMessage({ text: "Profile submitted! Awaiting admin approval.", type: "success" });
      }
      setPhotoFile(null);
      await fetchProfile();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || "Failed to save profile", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  /* ══════════════════════════════════
     CLINIC IMAGE HANDLERS
  ══════════════════════════════════ */
  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageUpload = async () => {
    if (!imageFile || !profile) return;
    setUploadingImage(true); setImageMsg(null);
    const formData = new FormData();
    formData.append("image", imageFile);
    if (imageCaption.trim()) formData.append("caption", imageCaption.trim());
    try {
      await axios.post(
        `http://localhost:5000/api/dentists/${profile.id}/images`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      setImageMsg({ text: "Image uploaded successfully!", type: "success" });
      setImageFile(null); setImagePreview(null); setImageCaption("");
      if (imageInputRef.current) imageInputRef.current.value = "";
      await fetchMedia(profile.id);
    } catch (err: any) {
      setImageMsg({ text: err.response?.data?.message || "Failed to upload image.", type: "error" });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!profile || !window.confirm("Delete this image?")) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/dentists/${profile.id}/images/${imageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClinicImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete image.");
    }
  };

  /* ══════════════════════════════════
     TESTIMONIAL VIDEO HANDLERS
  ══════════════════════════════════ */
  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
  };

  const handleVideoUpload = async () => {
    if (!videoFile || !profile) return;
    if (!videoPatientName.trim()) {
      setVideoMsg({ text: "Please enter the patient's name.", type: "error" }); return;
    }
    setUploadingVideo(true); setVideoMsg(null); setVideoProgress(0);
    const formData = new FormData();
    formData.append("video",        videoFile);
    formData.append("patient_name", videoPatientName.trim());
    if (videoDescription.trim()) formData.append("description", videoDescription.trim());
    try {
      await axios.post(
        `http://localhost:5000/api/dentists/${profile.id}/testimonials`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            if (e.total) setVideoProgress(Math.round((e.loaded / e.total) * 100));
          },
        }
      );
      setVideoMsg({ text: "Testimonial uploaded successfully!", type: "success" });
      setVideoFile(null); setVideoPatientName(""); setVideoDescription(""); setVideoProgress(0);
      if (videoInputRef.current) videoInputRef.current.value = "";
      await fetchMedia(profile.id);
    } catch (err: any) {
      setVideoMsg({ text: err.response?.data?.message || "Failed to upload video.", type: "error" });
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleDeleteTestimonial = async (testimonialId: number) => {
    if (!profile || !window.confirm("Delete this testimonial?")) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/dentists/${profile.id}/testimonials/${testimonialId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTestimonials((prev) => prev.filter((t) => t.id !== testimonialId));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete testimonial.");
    }
  };

  /* ── Derived ── */
  if (loading) return <div className="dentist-dashboard"><p>Loading...</p></div>;
  const categoryServices = services.filter((s) => s.category === activeCategory);
  const offeredCount     = services.filter((s) => s.fee > 0).length;

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <div className="dentist-dashboard">

      {/* ── Header ── */}
      <div className="dentist-dashboard__header">
        <div>
          <h1>Dentist Dashboard</h1>
          <p>Welcome, Dr. {user.name}</p>
        </div>
        {profile && (
          <span className={`status-badge ${STATUS_CONFIG[profile.status].color}`}>
            {STATUS_CONFIG[profile.status].icon} {profile.status}
          </span>
        )}
      </div>

      {/* ── Status Banner ── */}
      {profile && (
        <div className={`status-banner status-banner--${profile.status.toLowerCase()}`}>
          {STATUS_CONFIG[profile.status].msg}
          {profile.status === "APPROVED" && (
            <button className="view-profile-btn" onClick={() => navigate(`/dentists/${profile.id}`)}>
              View Public Profile →
            </button>
          )}
        </div>
      )}

      {message && (
        <div className={`dashboard-message dashboard-message--${message.type}`}>{message.text}</div>
      )}

      {!profile && (
        <div className="no-profile-notice">
          <h3>Complete Your Profile</h3>
          <p>Fill in your clinic details below to get listed on the platform.</p>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          DASHBOARD TABS (only show when profile exists)
      ══════════════════════════════════════════════ */}
      {profile && !isEditing && (
        <div className="dashboard-tabs">
          <button
            className={`dashboard-tab ${activeTab === "profile" ? "dashboard-tab--active" : ""}`}
            onClick={() => setActiveTab("profile")}
          > Profile</button>
          <button
            className={`dashboard-tab ${activeTab === "gallery" ? "dashboard-tab--active" : ""}`}
            onClick={() => setActiveTab("gallery")}
          >
             Clinic Gallery
            {clinicImages.length > 0 && <span className="dashboard-tab-badge">{clinicImages.length}</span>}
          </button>
          <button
            className={`dashboard-tab ${activeTab === "testimonials" ? "dashboard-tab--active" : ""}`}
            onClick={() => setActiveTab("testimonials")}
          >
             Testimonials
            {testimonials.length > 0 && <span className="dashboard-tab-badge">{testimonials.length}</span>}
          </button>

          <button
          className={`dashboard-tab ${activeTab === "slots" ? "dashboard-tab--active" : ""}`}
          onClick={() => setActiveTab("slots")}
        >
          🕐 My Slots
          {slots.length > 0 && <span className="dashboard-tab-badge">{slots.length}</span>}
        </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          PROFILE TAB (read-only view)
      ══════════════════════════════════════════════ */}
      {profile && !isEditing && activeTab === "profile" && (
        <div className="profile-view">
          <div className="profile-view__header">
            <h2>Your Profile</h2>
            <button className="edit-btn" onClick={() => setIsEditing(true)}>✎ Edit Profile</button>
          </div>
          <div className="profile-photo-display">
            {profile.profile_photo ? (
              <img src={`http://localhost:5000${profile.profile_photo}`} alt="Profile" className="profile-photo-img" />
            ) : (
              <div className="profile-photo-placeholder">No Photo</div>
            )}
          </div>
          <div className="profile-grid">
            <div className="profile-item"><label>Qualification</label><span>{profile.qualification}</span></div>
            <div className="profile-item"><label>Experience</label><span>{profile.experience} years</span></div>
            <div className="profile-item"><label>Specialization</label><span>{profile.specialization}</span></div>
            <div className="profile-item"><label>Clinic Name</label><span>{profile.clinic_name}</span></div>
            <div className="profile-item"><label>Clinic Address</label><span>{profile.clinic_address}</span></div>
            <div className="profile-item"><label>Base Consultation Fee</label><span>₹{profile.fees}</span></div>
          </div>
          {profile.services_offered && profile.services_offered.length > 0 && (
            <div className="services-view">
              <h3>Services Offered</h3>
              {SERVICE_CATALOGUE.map((cat) => {
                const catServices = profile.services_offered!.filter((s) => s.category === cat.category && s.fee > 0);
                if (catServices.length === 0) return null;
                return (
                  <div key={cat.category} className="services-category-block">
                    <h4 className="services-category-title">{cat.category}</h4>
                    <div className="services-list">
                      {catServices.map((s) => (
                        <div key={s.service_name} className="service-row-view">
                          <span>{s.service_name}</span>
                          <span className="service-fee-badge">₹{s.fee}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          GALLERY TAB
      ══════════════════════════════════════════════ */}
      {profile && !isEditing && activeTab === "gallery" && (
        <div className="media-section">
          <h2 className="media-section-title"> Clinic Gallery</h2>
          <p className="media-section-hint">Upload photos of your clinic — interior, equipment, reception area, etc. Patients love seeing the space before they visit.</p>

          {/* Upload area */}
          <div className="media-upload-card">
            <h3 className="media-upload-card-title">Upload New Photo</h3>

            {/* Drop zone */}
            <div
              className={`image-dropzone ${imagePreview ? "image-dropzone--has-preview" : ""}`}
              onClick={() => imageInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="image-dropzone-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button
                    className="image-dropzone-clear"
                    onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); if (imageInputRef.current) imageInputRef.current.value = ""; }}
                  >✕</button>
                </div>
              ) : (
                <div className="image-dropzone-placeholder">
                  <span className="image-dropzone-icon">📷</span>
                  <p>Click to select a photo</p>
                  <small>JPG, PNG or WEBP · Max 5 MB</small>
                </div>
              )}
            </div>
            <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleImageFileSelect} />

            <div className="media-upload-fields">
              <div className="media-field-group">
                <label>Caption (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Our modern treatment room"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                />
              </div>
              <button
                className="media-upload-btn"
                onClick={handleImageUpload}
                disabled={!imageFile || uploadingImage}
              >
                {uploadingImage ? "Uploading..." : "📤 Upload Photo"}
              </button>
            </div>

            {imageMsg && (
              <div className={`media-msg media-msg--${imageMsg.type}`}>
                {imageMsg.type === "success" ? "✅" : "❌"} {imageMsg.text}
              </div>
            )}
          </div>

          {/* Existing images grid */}
          {clinicImages.length === 0 ? (
            <div className="media-empty">
              <span>🏥</span>
              <p>No clinic photos yet. Upload your first photo above!</p>
            </div>
          ) : (
            <>
              <h3 className="media-existing-title">Your Photos ({clinicImages.length})</h3>
              <div className="clinic-images-grid">
                {clinicImages.map((img) => (
                  <div key={img.id} className="clinic-image-card">
                    <div className="clinic-image-wrap">
                      <img src={`http://localhost:5000${img.image_url}`} alt={img.caption || "Clinic photo"} />
                    </div>
                    {img.caption && <p className="clinic-image-caption">{img.caption}</p>}
                    <button className="clinic-image-delete" onClick={() => handleDeleteImage(img.id)}>
                      🗑 Delete
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TESTIMONIALS TAB
      ══════════════════════════════════════════════ */}
      {profile && !isEditing && activeTab === "testimonials" && (
        <div className="media-section">
          <h2 className="media-section-title"> Patient Testimonials</h2>
          <p className="media-section-hint">Upload short video testimonials from happy patients. These appear on your public profile and help build trust.</p>

          {/* Upload form */}
          <div className="media-upload-card">
            <h3 className="media-upload-card-title">Upload New Testimonial</h3>

            {/* Video file pick */}
            <div className={`video-dropzone ${videoFile ? "video-dropzone--selected" : ""}`} onClick={() => videoInputRef.current?.click()}>
              {videoFile ? (
                <div className="video-selected-info">
                  <span className="video-selected-icon">🎬</span>
                  <div>
                    <p className="video-selected-name">{videoFile.name}</p>
                    <p className="video-selected-size">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                  </div>
                  <button
                    className="video-clear-btn"
                    onClick={(e) => { e.stopPropagation(); setVideoFile(null); if (videoInputRef.current) videoInputRef.current.value = ""; }}
                  >✕</button>
                </div>
              ) : (
                <div className="video-dropzone-placeholder">
                  <span className="video-dropzone-icon">🎬</span>
                  <p>Click to select a video</p>
                  <small>MP4, WebM or MOV · Max 100 MB</small>
                </div>
              )}
            </div>
            <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime" style={{ display: "none" }} onChange={handleVideoFileSelect} />

            <div className="media-upload-fields">
              <div className="media-field-group">
                <label>Patient Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={videoPatientName}
                  onChange={(e) => setVideoPatientName(e.target.value)}
                />
              </div>
              <div className="media-field-group">
                <label>Description (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Root canal treatment — Pain-free experience"
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                />
              </div>

              {/* Upload progress */}
              {uploadingVideo && videoProgress > 0 && (
                <div className="video-progress-wrap">
                  <div className="video-progress-track">
                    <div className="video-progress-fill" style={{ width: `${videoProgress}%` }} />
                  </div>
                  <span className="video-progress-label">{videoProgress}%</span>
                </div>
              )}

              <button
                className="media-upload-btn"
                onClick={handleVideoUpload}
                disabled={!videoFile || uploadingVideo}
              >
                {uploadingVideo ? `Uploading... ${videoProgress}%` : "📤 Upload Testimonial"}
              </button>
            </div>

            {videoMsg && (
              <div className={`media-msg media-msg--${videoMsg.type}`}>
                {videoMsg.type === "success" ? "✅" : "❌"} {videoMsg.text}
              </div>
            )}
          </div>

          {/* Existing testimonials */}
          {testimonials.length === 0 ? (
            <div className="media-empty">
              <span></span>
              <p>No testimonials yet. Upload your first video above!</p>
            </div>
          ) : (
            <>
              <h3 className="media-existing-title">Your Testimonials ({testimonials.length})</h3>
              <div className="testimonials-manage-grid">
                {testimonials.map((t) => (
                  <div key={t.id} className="testimonial-manage-card">
                    <video
                      src={`http://localhost:5000${t.video_url}`}
                      controls
                      className="testimonial-manage-video"
                      preload="metadata"
                    />
                    <div className="testimonial-manage-info">
                      <p className="testimonial-manage-patient"> {t.patient_name}</p>
                      {t.description && <p className="testimonial-manage-desc">{t.description}</p>}
                      <button className="clinic-image-delete" onClick={() => handleDeleteTestimonial(t.id)}>
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
    SLOTS TAB
══════════════════════════════════════════════ */}
{profile && !isEditing && activeTab === "slots" && (
  <div className="media-section">
    <h2 className="media-section-title">🕐 Manage Available Slots</h2>
    <p className="media-section-hint">
      Add time slots when you are available. Patients will only see and book these slots.
    </p>

    {/* Add Slot Form */}
    <div className="media-upload-card">
      <h3 className="media-upload-card-title">Add New Slot</h3>
      <div className="slot-add-row">
        <div className="media-field-group">
          <label>Date *</label>
          <input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={slotDate}
            onChange={(e) => setSlotDate(e.target.value)}
          />
        </div>
        <div className="media-field-group">
          <label>Time *</label>
          <input
            type="time"
            value={slotTime}
            onChange={(e) => setSlotTime(e.target.value)}
          />
        </div>
        <button
          className="media-upload-btn"
          onClick={handleAddSlot}
          disabled={addingSlot}
        >
          {addingSlot ? "Adding..." : "➕ Add Slot"}
        </button>
      </div>
      {slotMsg && (
        <div className={`media-msg media-msg--${slotMsg.type}`}>
          {slotMsg.type === "success" ? "✅" : "❌"} {slotMsg.text}
        </div>
      )}
    </div>

    {/* Slots List */}
    {slots.length === 0 ? (
      <div className="media-empty">
        <span>🕐</span>
        <p>No upcoming slots. Add your first slot above!</p>
      </div>
    ) : (
      <>
        <h3 className="media-existing-title">Upcoming Slots ({slots.length})</h3>
        <div className="slots-manage-grid">
         {slots.map((slot) => (
          <div key={slot.id} className={`slot-card ${!slot.is_available ? "slot-card--booked" : ""}`}>
            <div className="slot-card-info">
              <span className="slot-card-date">
                📅 {new Date(slot.slot_date).toLocaleDateString("en-IN", {
                  weekday: "short", year: "numeric", month: "short", day: "numeric"
                })}
              </span>
              <span className="slot-card-time">
                🕐 {slot.slot_time.slice(0, 5)}
              </span>
              <span className={`slot-card-status ${slot.is_available ? "slot-card-status--open" : "slot-card-status--booked"}`}>
                {slot.is_available ? "Available" : "Booked"}
              </span>
            </div>

            {/* Patient details when booked */}
            {!slot.is_available && slot.patient_name && (
              <div className="slot-patient-info">
                <p><strong>👤 {slot.patient_name}</strong></p>
                {slot.patient_phone && <p>📞 {slot.patient_phone}</p>}
                {slot.patient_email && <p>✉️ {slot.patient_email}</p>}
                {slot.appointment_status && (
                  <span className={`slot-appt-status slot-appt-status--${slot.appointment_status.toLowerCase()}`}>
                    {slot.appointment_status}
                  </span>
                )}
                {slot.notes && <p className="slot-notes">📝 {slot.notes}</p>}
              </div>
            )}

            {slot.is_available && (
              <button className="clinic-image-delete" onClick={() => handleDeleteSlot(slot.id)}>
                🗑 Delete
              </button>
            )}
          </div>
        ))}
        </div>
      </>
    )}
  </div>
)}

      {/* ══════════════════════════════════════════════
          CREATE / EDIT FORM
      ══════════════════════════════════════════════ */}
      {(!profile || isEditing) && (
        <form className="dentist-profile-form" onSubmit={handleSubmit} encType="multipart/form-data">
          <h2>{profile ? "Edit Profile" : "Setup Your Profile"}</h2>

          {/* Profile Photo */}
          <div className="form-section">
            <h3 className="form-section-title">Profile Photo</h3>
            <div className="photo-upload-area">
              <div className="photo-preview" onClick={() => fileInputRef.current?.click()}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="photo-preview-img" />
                ) : (
                  <div className="photo-preview-placeholder">
                    <span></span>
                    <p>Click to upload photo</p>
                    <small>JPG, PNG or WEBP · Max 5MB</small>
                  </div>
                )}
                {photoPreview && <div className="photo-change-overlay">Change Photo</div>}
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} style={{ display: "none" }} />
            </div>
          </div>

          {/* Basic Info */}
          <div className="form-section">
            <h3 className="form-section-title">Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Qualification *</label>
                <input name="qualification" placeholder="e.g. BDS, MDS" value={form.qualification} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Experience (years) *</label>
                <input name="experience" type="number" placeholder="e.g. 5" value={form.experience} onChange={handleChange} min="0" required />
              </div>
              <div className="form-group">
                <label>Primary Specialization *</label>
                <select name="specialization" value={form.specialization} onChange={handleChange}>
                  {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Base Consultation Fee (₹) *</label>
                <input name="fees" type="number" placeholder="e.g. 500" value={form.fees} onChange={handleChange} min="0" required />
              </div>
              <div className="form-group form-group--full">
                <label>Clinic Name *</label>
                <input name="clinic_name" placeholder="e.g. Smile Dental Clinic" value={form.clinic_name} onChange={handleChange} required />
              </div>
              <div className="form-group form-group--full">
                <label>Clinic Address *</label>
                <input name="clinic_address" placeholder="e.g. 123 Main St, Mumbai" value={form.clinic_address} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Latitude</label>
                <input name="latitude" type="number" step="any" placeholder="e.g. 19.0760" value={form.latitude} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input name="longitude" type="number" step="any" placeholder="e.g. 72.8777" value={form.longitude} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Services & Fees */}
          <div className="form-section">
            <h3 className="form-section-title">
              Services & Fees
              <span className="services-count-badge">{offeredCount} service{offeredCount !== 1 ? "s" : ""} added</span>
            </h3>
            <p className="services-hint">Enter ₹0 to skip a service. Only services with a fee will be shown to patients.</p>
            <div className="services-tabs">
              {SERVICE_CATALOGUE.map((cat) => {
                const hasServices = services.some((s) => s.category === cat.category && s.fee > 0);
                return (
                  <button
                    key={cat.category} type="button"
                    className={`services-tab ${activeCategory === cat.category ? "services-tab--active" : ""} ${hasServices ? "services-tab--has-data" : ""}`}
                    onClick={() => setActiveCategory(cat.category)}
                  >
                    {cat.category}
                    {hasServices && <span className="tab-dot" />}
                  </button>
                );
              })}
            </div>
            <div className="services-panel">
              {categoryServices.map((s) => (
                <div key={s.service_name} className="service-input-row">
                  <label className="service-input-label">{s.service_name}</label>
                  <div className="service-fee-input-wrapper">
                    <span className="rupee-symbol">₹</span>
                    <input
                      type="number" min="0" placeholder="0"
                      value={s.fee === 0 ? "" : s.fee}
                      className="service-fee-input"
                      onChange={(e) => handleServiceFeeChange(s.category, s.service_name, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? "Saving..." : profile ? "Save Changes" : "Submit Profile"}
            </button>
            {isEditing && (
              <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default DentistDashboard;