import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../../styles/Moneyback.css";

const steps = [
  {
    number: "01",
    icon: "📞",
    title: "Call Us",
    desc: "Reach out to our cashback team right after your dental visit. Our support line is available Mon–Sat, 9 AM to 7 PM.",
  },
  {
    number: "02",
    icon: "🧾",
    title: "Submit Your Bills",
    desc: "Upload or WhatsApp a clear photo of your dental invoice. We accept bills from any verified DentistFinder clinic.",
  },
  {
    number: "03",
    icon: "💸",
    title: "Get Money Back",
    desc: "3% of your total billing value lands directly in your registered bank account within 3 working days. No questions asked.",
  },
];

const examples = [
  { bill: "₹1,000",  back: "₹30" },
  { bill: "₹5,000",  back: "₹150" },
  { bill: "₹10,000", back: "₹300" },
  { bill: "₹25,000", back: "₹750" },
];

const faqs = [
  {
    q: "Which appointments are eligible?",
    a: "Any appointment booked and completed through DentistFinder qualifies — consultations, procedures, follow-ups, all included.",
  },
  {
    q: "Is there a minimum billing amount?",
    a: "No minimum. Whether your bill is ₹300 or ₹30,000, you get 3% back on the full amount.",
  },
  {
    q: "How many times can I claim?",
    a: "Every single appointment. There's no cap on the number of claims per patient.",
  },
  {
    q: "What payment methods are supported?",
    a: "We transfer directly to any Indian bank account via NEFT/IMPS. UPI accounts are also supported.",
  },
];

const MoneyBack: React.FC = () => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("animate-in");
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mb-page">

      {/* ── HERO ── */}
      <section className="mb-hero">
        <div className="mb-hero__bg">
          <img
            src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1600&h=800&fit=crop"
            alt="Dental cashback"
          />
          <div className="mb-hero__overlay" />
        </div>
        <div className="mb-hero__content">
          <span className="mb-hero__tag">Exclusive Patient Benefit</span>
          <h1>
            Get <em>3% Money Back</em><br />
            on Every Dental Bill
          </h1>
          <p>
            Book through DentistFinder, submit your bill, and we'll transfer
            3% of your total billing value straight into your bank account —
            within <strong>3 working days.</strong>
          </p>
          <div className="mb-hero__pills">
            <span className="mb-pill">✓ No minimum amount</span>
            <span className="mb-pill">✓ Every appointment</span>
            <span className="mb-pill">✓ 3 working days</span>
          </div>
          <Link to="/my-appointments" className="mb-hero__cta">
            View My Appointments →
          </Link>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="mb-stats">
        {[
          { value: "3%",  label: "Flat Cashback" },
          { value: "3",   label: "Working Days" },
          { value: "₹0",  label: "Minimum Bill" },
          { value: "∞",   label: "Claims Allowed" },
        ].map((s, i) => (
          <div className="mb-stats__item reveal" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
            <h3>{s.value}</h3>
            <p>{s.label}</p>
          </div>
        ))}
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="mb-steps">
        <div className="mb-steps__header">
          <span className="section-tag reveal">Simple 3-Step Process</span>
          <h2 className="reveal">Claiming Is Effortless</h2>
          <p className="reveal">No paperwork, no waiting. Just 3 quick steps and your money is on its way.</p>
        </div>
        <div className="mb-steps__grid">
          {steps.map((s, i) => (
            <div className="mb-step-card reveal" key={i} style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="mb-step-card__number">{s.number}</div>
              <div className="mb-step-card__icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SAVINGS SECTION ── */}
      <section className="mb-earn">
        <div className="mb-earn__inner">
          <div className="mb-earn__text reveal">
            <span className="section-tag">Real Savings</span>
            <h2>How Much Will You Save?</h2>
            <p>
              Every rupee you spend on dental care at a DentistFinder clinic
              earns you 3% back — automatically, every time, no limits.
            </p>
            <div className="mb-earn__bullets">
              <div className="bullet"><span>✓</span> Flat 3% on total bill value</div>
              <div className="bullet"><span>✓</span> Applies to all treatments</div>
              <div className="bullet"><span>✓</span> Direct bank / UPI transfer</div>
              <div className="bullet"><span>✓</span> Credited within 3 working days</div>
            </div>
          </div>
          <div className="mb-earn__cards reveal">
            {examples.map((ex, i) => (
              <div className="mb-earn-card" key={i}>
                <div className="mb-earn-card__bill">Bill <strong>{ex.bill}</strong></div>
                <div className="mb-earn-card__arrow">→</div>
                <div className="mb-earn-card__back">
                  <small>You get back</small>
                  <span>{ex.back}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="mb-contact">
        <div className="mb-contact__inner">
          <div className="mb-contact__text reveal">
            <span className="section-tag">Ready to Claim?</span>
            <h2>Our Cashback Team Is Here for You</h2>
            <p>
              Keep your dental bill handy and reach out directly.
              We're available <strong>Mon–Sat, 9 AM – 7 PM.</strong> Most claims
              are processed the same day they're submitted.
            </p>
            <div className="mb-contact__details">
              <a href="tel:+918888888888" className="mb-contact__item">
                <span>📞</span>
                <div>
                  <small>Call / WhatsApp</small>
                  <strong>+91 88888 88888</strong>
                </div>
              </a>
              <a href="mailto:cashback@dentistfinder.in" className="mb-contact__item">
                <span>✉️</span>
                <div>
                  <small>Email Us</small>
                  <strong>cashback@dentistfinder.in</strong>
                </div>
              </a>
            </div>
          </div>

          <div className="mb-contact__visual reveal">
            <div className="mb-cashback-card">
              <div className="mb-cashback-card__label">Your Cashback</div>
              <div className="mb-cashback-card__amount">3%</div>
              <div className="mb-cashback-card__sub">of total billing value</div>
              <div className="mb-cashback-card__timeline">
                <span>Claim submitted</span>
                <div className="mb-timeline-bar">
                  <div className="mb-timeline-fill" />
                </div>
                <span>In your account</span>
              </div>
              <div className="mb-cashback-card__badge">Within 3 working days</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="mb-faq">
        <div className="mb-faq__header">
          <span className="section-tag reveal">Got Questions?</span>
          <h2 className="reveal">Frequently Asked Questions</h2>
        </div>
        <div className="mb-faq__list">
          {faqs.map((f, i) => (
            <div
              className={`mb-faq__item reveal ${openFaq === i ? "open" : ""}`}
              key={i}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="mb-faq__q">
                <span>{f.q}</span>
                <span className="mb-faq__arrow">{openFaq === i ? "▲" : "▼"}</span>
              </div>
              {openFaq === i && <div className="mb-faq__a">{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="mb-cta">
        <div className="mb-cta__inner reveal">
          <h2>Start Saving on Your Next Visit</h2>
          <p>Book a dentist today — your cashback claim takes less than 2 minutes.</p>
          <div className="mb-cta__buttons">
            <Link to="/dentists"        className="cta-btn cta-btn--primary">Find a Dentist Now →</Link>
            <Link to="/my-appointments" className="cta-btn cta-btn--outline">My Appointments</Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default MoneyBack;