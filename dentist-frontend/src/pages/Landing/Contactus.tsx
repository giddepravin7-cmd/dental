import React, { useEffect, useRef, useState } from "react";
import "../../styles/Contact.css";

const contactInfo = [
  {
    icon: "📍",
    title: "Visit Us",
    lines: ["DentistFinder HQ", "Level 5, Tech Park, Bandra Kurla Complex", "Mumbai, Maharashtra 400051"],
  },
  {
    icon: "📞",
    title: "Call Us",
    lines: ["Toll Free: 1800-000-0000", "Mon–Sat: 9:00 AM – 6:00 PM IST", "Emergency: +91 98765 43210"],
  },
  {
    icon: "📩",
    title: "Email Us",
    lines: ["support@dentistfinder.in", "partnerships@dentistfinder.in", "We reply within 2 hours"],
  },
];

const socials = [
  { icon: "𝕏", label: "Twitter",   href: "#" },
  { icon: "f", label: "Facebook",  href: "#" },
  { icon: "in", label: "LinkedIn", href: "#" },
  { icon: "▶", label: "YouTube",   href: "#" },
];

const ContactUs: React.FC = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("animate-in")),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="contact-page">

      {/* ── Hero ── */}
      <section className="contact-hero">
        <div className="contact-hero__bg">
          <img
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1600&h=600&fit=crop"
            alt="Contact us"
          />
          <div className="contact-hero__overlay" />
        </div>
        <div className="contact-hero__content">
          <span className="contact-tag">Get In Touch</span>
          <h1>We'd Love to <em>Hear From You</em></h1>
          <p>
            Have a question, feedback, or need help? Our team is ready to assist you.
            Reach out and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* ── Contact Cards ── */}
      <section className="contact-cards">
        {contactInfo.map((info, i) => (
          <div className="contact-card reveal" key={i} style={{ animationDelay: `${i * 0.12}s` }}>
            <div className="contact-card__icon">{info.icon}</div>
            <h3>{info.title}</h3>
            {info.lines.map((line, j) => (
              <p key={j}>{line}</p>
            ))}
          </div>
        ))}
      </section>

      {/* ── Main: Form + Map ── */}
      <section className="contact-main">

        {/* Form */}
        <div className="contact-form-wrapper reveal">
          <div className="contact-form-header">
            <span className="contact-section-tag">Send a Message</span>
            <h2>How can we help you?</h2>
            <p>Fill in the form below and our team will respond within 2 hours.</p>
          </div>

          {submitted ? (
            <div className="contact-success">
              <div className="contact-success__icon">✅</div>
              <h3>Message Sent!</h3>
              <p>Thank you for reaching out, <strong>{form.name}</strong>. We'll reply to <strong>{form.email}</strong> within 2 hours.</p>
              <button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}>
                Send Another Message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form__row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    name="name"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="contact-form__row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    name="phone"
                    placeholder="+91 99999 99999"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Subject *</label>
                  <select name="subject" value={form.subject} onChange={handleChange} required>
                    <option value="">Select a topic...</option>
                    <option value="General Enquiry">General Enquiry</option>
                    <option value="Appointment Issue">Appointment Issue</option>
                    <option value="Dentist Registration">Dentist Registration</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Billing">Billing / Payments</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  name="message"
                  rows={6}
                  placeholder="Describe your issue or question in detail..."
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="contact-submit-btn" disabled={loading}>
                {loading ? (
                  <span className="contact-loading">
                    <span className="contact-spinner" /> Sending...
                  </span>
                ) : (
                  "Send Message →"
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right side: Map + Extra Info */}
        <div className="contact-side">

          {/* Embedded Map */}
          <div className="contact-map reveal">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.0!2d72.8654!3d19.0596!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDAzJzM0LjYiTiA3MsKwNTEnNTUuNCJF!5e0!3m2!1sen!2sin!4v1234567890"
              title="DentistFinder Office Location"
              allowFullScreen
              loading="lazy"
            />
          </div>

          {/* Working Hours */}
          <div className="contact-hours reveal">
            <h3>🕐 Working Hours</h3>
            <div className="hours-list">
              <div className="hours-item">
                <span>Monday – Friday</span>
                <span className="hours-time">9:00 AM – 6:00 PM</span>
              </div>
              <div className="hours-item">
                <span>Saturday</span>
                <span className="hours-time">10:00 AM – 4:00 PM</span>
              </div>
              <div className="hours-item">
                <span>Sunday</span>
                <span className="hours-time hours-closed">Closed</span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="contact-socials reveal">
            <h3>Follow Us</h3>
            <div className="socials-list">
              {socials.map((s, i) => (
                <a key={i} href={s.href} className="social-btn" aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── Photo Strip ── */}
      <section className="contact-photos">
        <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=260&fit=crop" alt="Team 1" />
        <img src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&h=260&fit=crop" alt="Team 2" />
        <img src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=260&fit=crop" alt="Team 3" />
        <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=260&fit=crop" alt="Team 4" />
      </section>

    </div>
  );
};

export default ContactUs;