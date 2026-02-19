import React, { useEffect, useRef, useState } from "react";
import '../../styles/Landing.css';
import { Link } from "react-router-dom";

const stats = [
  { value: "50+", label: "Verified Dentists" },
  { value: "100+", label: "Happy Patients" },
  { value: "2+", label: "Cities Covered" },
  { value: "4.9★", label: "Average Rating" },
];

const features = [
  {
    icon: "",
    title: "Smart Search",
    desc: "Filter by specialty, location, availability  — find exactly who you need.",
    img: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&q=80",
  },
  {
    icon: "",
    title: "Rich Profiles",
    desc: "View credentials, patient photos, treatment portfolios, fees, and verified reviews.",
    img: "https://images.unsplash.com/photo-1588776814546-1ffbb4d52f8e?w=600&q=80",
  },
  {
    icon: "",
    title: "Instant Booking",
    desc: "Real-time availability. Book, reschedule, or cancel appointments in seconds.",
    img: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=600&q=80",
  },
];

const specialties = [
  { name: "General Dentistry", icon: "", color: "#e0f2fe" },
  { name: "Orthodontics", icon: "", color: "#f0fdf4" },
  { name: "Cosmetic Dentistry", icon: "", color: "#fef9c3" },
  { name: "Pediatric Dentistry", icon: "", color: "#fce7f3" },
  { name: "Oral Surgery", icon: "", color: "#ede9fe" },
  { name: "Periodontics", icon: "", color: "#fff7ed" },
  { name: "Endodontics", icon: "", color: "#f0fdfa" },
  { name: "Implants", icon: "", color: "#fef2f2" },
];

const testimonials = [
  {
    name: "Sarah M.",
    location: "New York, NY",
    text: "Found an amazing dentist within 10 minutes. The profile photos and reviews gave me so much confidence before my first visit.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
  },
  {
    name: "James T.",
    location: "Los Angeles, CA",
    text: "I was terrified of dentists. This platform helped me find one specializing in anxious patients. Life-changing experience!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
  },
  {
    name: "Priya K.",
    location: "Chicago, IL",
    text: "Transparent pricing, no surprises. Booked, went, got my cleaning. Exactly as described. Will use again!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
  },
];

const faqs = [
  {
    q: "Is Dentist Finder free to use?",
    a: "Yes! Searching for dentists and viewing profiles is completely free. You only pay your dentist directly for services.",
  },
  {
    q: "How are dentists verified?",
    a: "Every dentist on our platform undergoes license verification, credential checks, and ongoing patient review monitoring.",
  },
  {
    q: "Can I cancel or reschedule appointments?",
    a: "Absolutely. You can manage all appointments directly from your dashboard — cancel or reschedule up to 24 hours before.",
  },
  {
    q: "What if I need an emergency appointment?",
    a: "Use the 'Emergency' filter in search to find dentists with same-day availability near you.",
  },
];

const Landing: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-root">

      {/* ── HERO ── */}
      <section className="hero" ref={heroRef}>
        <div className="hero-bg-grid" />
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />

        <div className="hero-content">
          <span className="hero-badge">Trusted by 100+ patients</span>
          <h1 className="hero-title">
            Your Perfect Dentist,<br />
            <span className="hero-gradient-text">Just a Click Away</span>
          </h1>
          <p className="hero-subtitle">
            Search verified dentists by specialty, location & availability.
            Read real reviews, compare fees, and book online — all in one place.
          </p>

          <div className="hero-cta-row">
            <Link to="/register">
              <button className="btn-primary">Get Started Free</button>
            </Link>
            <a href="#how-it-works" className="btn-ghost">
              <span className="play-icon">▶</span> See How It Works
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=700&q=85"
              alt="Dentist smiling"
              className="hero-img"
            />
            <div className="hero-card hero-card-1">
              <span className="hero-card-icon">✅</span>
              <div>
                <strong>Verified Dentists</strong>
              </div>
            </div>
            <div>
              <div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="stats-strip reveal">
        {stats.map((s, i) => (
          <div className="stat-item" key={i}>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="how-section reveal">
        <div className="section-label">Simple Process</div>
        <h2 className="section-title">Book in 3 Easy Steps</h2>
        <p className="section-sub">No phone calls. No waiting on hold. Just seamless online booking.</p>

        <div className="steps-grid">
          {features.map((f, i) => (
            <div className="step-card reveal" key={i} style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="step-number">0{i + 1}</div>
              <img src={f.img} alt={f.title} className="step-img" />
              <div className="step-body">
                <span className="step-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── VIDEO SECTION ── */}
      <section className="video-section reveal">
        <div className="video-text">
          <div className="section-label">See It In Action</div>
          <h2 className="section-title left">Watch How <span className="hero-gradient-text">Dentist Finder</span> Works</h2>
          <p className="section-sub left">
            Our platform makes finding and booking a dentist effortless. From search to confirmation — under 2 minutes.
          </p>
          <ul className="video-bullets">
            <li>✅ Search by specialty, location</li>
            <li>✅ View real patient before/after photos</li>
            <li>✅ Read verified, authentic reviews</li>
            <li>✅ Book with real-time calendar availability</li>
          </ul>
          <Link to="/register">
            <button className="btn-primary">Try It Free</button>
          </Link>
        </div>
        <div className="video-frame-wrap">
          <iframe
            className="video-frame"
            src="https://www.youtube.com/embed/iRp_fHt3NfA?rel=0&modestbranding=1"
            title="How Dentist Finder Works"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>

      {/* ── SPECIALTIES ── */}
      <section className="specialties-section reveal">
        <div className="section-label">All Needs Covered</div>
        <div className="specialty-grid">
          {specialties.map((s, i) => (
            <Link to="#" key={i}>
              <div className="specialty-card" style={{ background: s.color }}>
                <span className="specialty-icon">{s.icon}</span>
                <span>{s.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── IMAGE GALLERY STRIP ── */}
      <section className="gallery-section reveal">
        <div className="section-label">Real Clinics, Real Care</div>
        <h2 className="section-title">Modern Dental Practices Near You</h2>
        <div className="gallery-scroll">
          {[
            "https://images.unsplash.com/photo-1629909615957-be38d48fbbe4?w=500&q=80",
            "https://images.unsplash.com/photo-1588776814546-1ffbb4d52f8e?w=500&q=80",
            "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&q=80",
            "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&q=80",
            "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&q=80",
          ].map((src, i) => (
            <div className="gallery-img-wrap" key={i}>
              <img src={src} alt={`Dental clinic ${i + 1}`} />
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials-section reveal">
        <div className="section-label">Patient Stories</div>
        <h2 className="section-title">What Our Users Say</h2>
        <div className="testimonial-grid">
          {testimonials.map((t, i) => (
            <div className="testimonial-card reveal" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="stars">{"★".repeat(t.rating)}</div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <img src={t.avatar} alt={t.name} />
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRUST SECTION ── */}
      <section className="trust-section reveal">
        <div className="trust-content">
          <div className="trust-text">
            <div className="section-label">Safety First</div>
            <h2 className="section-title left">Every Dentist is <span className="hero-gradient-text">Fully Verified</span></h2>
            <p className="section-sub left">
              We manually verify licenses, check disciplinary records, and monitor patient reviews so you always get the best care.
            </p>
            <div className="trust-badges">
              <div className="trust-badge"> License Verified</div>
              <div className="trust-badge"> HIPAA Compliant</div>
              <div className="trust-badge"> Reviewed Monthly</div>
              <div className="trust-badge"> Secure Booking</div>
            </div>
          </div>
          <div className="trust-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=650&q=80"
              alt="Dentist with patient"
              className="trust-img"
            />
          </div>
        </div>
      </section>

      {/* ── VIDEO 2: Patient Testimonial ── */}
      <section className="video2-section reveal">
        <div className="section-label">Real Experiences</div>
        <h2 className="section-title">Hear Directly from Patients</h2>
        <p className="section-sub">One hundred of people found their perfect dentist. Here are their stories.</p>
        <div className="video2-grid">
          <div className="video-frame-wrap small">
            <iframe
              className="video-frame"
              src="https://www.youtube.com/embed/K5vlQxCUF2I?rel=0&modestbranding=1"
              title="Patient Testimonial"
              frameBorder="0"
              allowFullScreen
            />
          </div>
          <div className="video-frame-wrap small">
            <iframe
              className="video-frame"
              src="https://www.youtube.com/embed/c6BqPrbtJBM?rel=0&modestbranding=1"
              title="Dental Care Tips"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section reveal">
        <div className="section-label">Got Questions?</div>
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((f, i) => (
            <div
              className={`faq-item ${openFaq === i ? "open" : ""}`}
              key={i}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="faq-q">
                <span>{f.q}</span>
                <span className="faq-arrow">{openFaq === i ? "▲" : "▼"}</span>
              </div>
              {openFaq === i && <div className="faq-a">{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta-banner reveal">
        <div className="cta-blob cta-blob-1" />
        <div className="cta-blob cta-blob-2" />
        <div className="cta-inner">
          <h2>Ready to Find Your Perfect Dentist?</h2>
          <p> 100+ patients who found care they trust — for free.</p>
          <div className="cta-btns">
            <Link to="/register">
              <button className="btn-white">Create Free Account</button>
            </Link>
            <Link to="/search">
              <button className="btn-outline-white">Browse Dentists</button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;