import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/Faq.css";

const categories = ["All", "Patients", "Dentists", "Appointments", "Payments", "Platform"];

const faqs = [
  // Patients
  {
    category: "Patients",
    question: "How do I find a dentist near me?",
    answer:
      "Simply go to our 'Find Dentists' page, and you'll see a list of all verified dentists on our platform. You can filter by specialization, fees, experience, and location. Click on any dentist to view their full profile and available appointment slots.",
  },
  {
    category: "Patients",
    question: "Are all dentists on DentistFinder verified?",
    answer:
      "Yes, absolutely. Every dentist who joins our platform goes through a strict verification process. We check their dental degree certificates, license from the Dental Council of India (DCI), clinic registration, and professional experience before approving their profile.",
  },
  {
    category: "Patients",
    question: "Is it free to use DentistFinder as a patient?",
    answer:
      "Yes! Creating an account and browsing dentists is completely free for patients. You only pay the dentist's consultation fee directly when you visit the clinic. We do not charge any booking or platform fees.",
  },
  {
    category: "Patients",
    question: "Can I see patient reviews before booking?",
    answer:
      "Yes, each dentist's profile displays ratings and reviews from verified patients. We only allow reviews from patients who have actually completed an appointment through our platform, ensuring authenticity.",
  },
  // Dentists
  {
    category: "Dentists",
    question: "How do I register as a dentist on DentistFinder?",
    answer:
      "Click 'Register' on the top navigation, select 'Dentist' as your role, and fill in your details. After registering, log in and complete your clinic profile — including your qualifications, specialization, fees, and clinic address. Our admin team will review and approve your profile within 24–48 hours.",
  },
  {
    category: "Dentists",
    question: "What documents do I need to register as a dentist?",
    answer:
      "You'll need your BDS/MDS degree certificate, a valid registration certificate from the Dental Council of India (DCI), and your clinic's address details. These are verified manually by our team before your profile goes live.",
  },
  {
    category: "Dentists",
    question: "How long does profile approval take?",
    answer:
      "Our admin team reviews all dentist profiles within 24 to 48 working hours. You'll be able to see your profile status (Pending / Approved / Rejected) from your dentist dashboard. If rejected, you'll receive a reason and can resubmit.",
  },
  {
    category: "Dentists",
    question: "Can I update my fees and clinic information?",
    answer:
      "Yes! You can update your clinic profile anytime from your dentist dashboard — including fees, address, specialization, and experience. Changes are reflected immediately on your public profile.",
  },
  // Appointments
  {
    category: "Appointments",
    question: "How do I book an appointment?",
    answer:
      "Browse dentists, click on the dentist you want, select your preferred date and time, add optional notes, and click 'Book Now'. You'll need to be logged in as a patient to book. The appointment will appear in your 'My Appointments' page instantly.",
  },
  {
    category: "Appointments",
    question: "Can I cancel or reschedule an appointment?",
    answer:
      "Yes. Go to 'My Appointments', find the appointment you want to change, and click 'Cancel' or 'Reschedule'. You can cancel or reschedule appointments that are in PENDING or CONFIRMED status. Completed appointments cannot be modified.",
  },
  {
    category: "Appointments",
    question: "What happens after I book an appointment?",
    answer:
      "Once you book, your appointment status will be 'PENDING'. The dentist will review and confirm it, at which point the status changes to 'CONFIRMED'. You can view all your appointment details, including the clinic address and dentist's phone number, from your appointments page.",
  },
  {
    category: "Appointments",
    question: "Can I book appointments for family members?",
    answer:
      "Currently, each account books appointments for the account holder. We are actively working on a family member booking feature that will be released in a future update.",
  },
  // Payments
  {
    category: "Payments",
    question: "How do payments work?",
    answer:
      "Payments are made directly to the dentist at the clinic — either in cash, UPI, or card, depending on what the clinic accepts. DentistFinder does not process or collect payments. The consultation fee shown on each dentist's profile is their standard charge.",
  },
  {
    category: "Payments",
    question: "Are there any hidden charges?",
    answer:
      "No hidden charges whatsoever. The fee shown on the dentist's profile is exactly what you pay at the clinic. DentistFinder is completely free for patients to use.",
  },
  {
    category: "Payments",
    question: "What if a dentist charges more than listed?",
    answer:
      "If a dentist charges more than the fee listed on our platform without prior notice, please report it to us via the Contact Us page. We take pricing transparency very seriously and will investigate the matter promptly.",
  },
  // Platform
  {
    category: "Platform",
    question: "Is my personal data safe?",
    answer:
      "Absolutely. We use industry-standard encryption (JWT tokens, bcrypt password hashing) and never share your personal data with third parties. Your contact details are only visible to the dentist you book with.",
  },
  {
    category: "Platform",
    question: "Is DentistFinder available as a mobile app?",
    answer:
      "Our web platform is fully responsive and works great on mobile browsers. A dedicated Android and iOS app is currently in development and will be launched soon. Stay tuned!",
  },
  {
    category: "Platform",
    question: "Which cities is DentistFinder available in?",
    answer:
      "We are currently available in 50+ cities across India including Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, Kolkata, Ahmedabad, and more. We're expanding rapidly — if your city isn't listed yet, it will be soon!",
  },
];

const FAQ: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("animate-in")),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const filtered = faqs.filter((f) => {
    const matchCat = activeCategory === "All" || f.category === activeCategory;
    const matchSearch =
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="faq-page">

      {/* ── Hero ── */}
      <section className="faq-hero">
        <div className="faq-hero__bg">
          <img
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&h=600&fit=crop"
            alt="FAQ background"
          />
          <div className="faq-hero__overlay" />
        </div>
        <div className="faq-hero__content">
          <span className="faq-tag">Help Center</span>
          <h1>Frequently Asked <em>Questions</em></h1>
          <p>Everything you need to know about DentistFinder. Can't find your answer? Contact us.</p>

          {/* Search Bar */}
          <div className="faq-search">
            <span className="faq-search__icon">🔍</span>
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOpenIndex(null); }}
            />
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="faq-stats">
        <div className="faq-stat reveal"><h3>18+</h3><p>Questions Answered</p></div>
        <div className="faq-stat reveal"><h3>24/7</h3><p>Support Available</p></div>
        <div className="faq-stat reveal"><h3>2min</h3><p>Avg Response Time</p></div>
      </div>

      {/* ── Main Content ── */}
      <section className="faq-main">

        {/* Category Filter */}
        <div className="faq-categories reveal">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`faq-cat-btn ${activeCategory === cat ? "faq-cat-btn--active" : ""}`}
              onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
            >
              {cat}
              <span className="faq-cat-count">
                {cat === "All" ? faqs.length : faqs.filter((f) => f.category === cat).length}
              </span>
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className="faq-list">
          {filtered.length === 0 ? (
            <div className="faq-empty reveal">
              <p>😕 No questions found for "<strong>{search}</strong>"</p>
              <button onClick={() => { setSearch(""); setActiveCategory("All"); }}>
                Clear Search
              </button>
            </div>
          ) : (
            filtered.map((faq, i) => (
              <div
                key={i}
                className={`faq-item reveal ${openIndex === i ? "faq-item--open" : ""}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <button
                  className="faq-item__question"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <div className="faq-item__left">
                    <span className="faq-item__cat">{faq.category}</span>
                    <span className="faq-item__text">{faq.question}</span>
                  </div>
                  <span className={`faq-item__icon ${openIndex === i ? "faq-item__icon--open" : ""}`}>
                    ＋
                  </span>
                </button>
                <div className={`faq-item__answer ${openIndex === i ? "faq-item__answer--open" : ""}`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Still have questions ── */}
      <section className="faq-contact-cta">
        <div className="faq-contact-cta__inner reveal">
          <img
            src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&h=400&fit=crop"
            alt="Support team"
          />
          <div className="faq-contact-cta__text">
            <h2>Still have questions?</h2>
            <p>
              Our support team is available Monday to Saturday, 9AM to 6PM IST.
              We typically respond within 2 hours.
            </p>
            <div className="faq-contact-cta__buttons">
              <Link to="/contact" className="faq-cta-btn faq-cta-btn--primary">
                📩 Contact Us
              </Link>
              <a href="tel:+911800000000" className="faq-cta-btn faq-cta-btn--outline">
                📞 Call Support
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default FAQ;