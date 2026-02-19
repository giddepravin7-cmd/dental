import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../../styles/About.css";

const stats = [
  { number: "100+", label: "Happy Patients" },
  { number: "50+",    label: "Verified Dentists" },
  { number: "2+",     label: "Cities Covered" },
  { number: "4.9★",    label: "Average Rating" },
];

const team = [
  {
    name: "Dr. Priya Sharma",
    role: "Chief Medical Officer",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop",
    bio: "15+ years in dental care. Passionate about making quality dental services accessible to all.",
  },
  {
    name: "Rahul Mehta",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    bio: "Tech entrepreneur with a vision to bridge the gap between patients and dental professionals.",
  },
  {
    name: "Ananya Patel",
    role: "Head of Operations",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    bio: "Ensuring every patient and dentist has a seamless experience on our platform.",
  },
  {
    name: "Dr. Arjun Nair",
    role: "Dental Advisor",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
    bio: "Orthodontic specialist helping us maintain the highest standards for dentist verification.",
  },
];

const values = [
  {
    icon: "",
    title: "Trust & Safety",
    desc: "Every dentist on our platform is thoroughly verified, licensed, and background-checked before approval.",
  },
  {
    icon: "",
    title: "Innovation",
    desc: "We use technology to make booking appointments as simple as a few taps — anytime, anywhere.",
  },
  {
    icon: "",
    title: "Patient First",
    desc: "Every decision we make is centered around delivering the best possible experience for patients.",
  },
  {
    icon: "",
    title: "Accessibility",
    desc: "Quality dental care should be available to everyone, regardless of location or background.",
  },
];

const AboutUs: React.FC = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll(".reveal").forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="about-page">

      {/* ── Hero Section ── */}
      <section className="about-hero">
        <div className="about-hero__bg">
          <img
            src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1600&h=800&fit=crop"
            alt="Dental clinic"
          />
          <div className="about-hero__overlay" />
        </div>
        <div className="about-hero__content">
          <span className="about-hero__tag">Our Story</span>
          <h1>
            Making Dental Care <br />
            <em>Simple & Accessible</em>
          </h1>
          <p>
            DentistFinder was born from a simple belief — finding a trusted dentist
            should never be difficult. We connect patients with verified dental
            professionals across India, making quality oral care accessible to everyone.
          </p>
          <Link to="/dentists" className="about-hero__cta">
            Find a Dentist Near You →
          </Link>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="about-stats">
        {stats.map((s, i) => (
          <div className="about-stats__item reveal" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
            <h3>{s.number}</h3>
            <p>{s.label}</p>
          </div>
        ))}
      </section>

      {/* ── Mission Section ── */}
      <section className="about-mission">
        <div className="about-mission__image reveal">
          <img
            src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=700&h=500&fit=crop"
            alt="Dentist with patient"
          />
        </div>
        <div className="about-mission__text reveal">
          <span className="section-tag">Our Mission</span>
          <h2>We're on a mission to transform dental healthcare in India</h2>
          <p>
            Millions of Indians delay dental treatment because they don't know
            where to find a trusted, affordable dentist nearby. DentistFinder
            solves that problem — bringing transparency, convenience, and trust
            to every dental appointment.
          </p>
          <p>
            We rigorously verify every dentist's qualifications, licensing, and
            clinic standards before they join our platform. Patients can read
            real reviews, compare fees, and book appointments instantly —
            all in one place.
          </p>
          <div className="about-mission__bullets">
            <div className="bullet"><span>✓</span> Verified & licensed dentists only</div>
            <div className="bullet"><span>✓</span> Transparent pricing — no hidden fees</div>
            <div className="bullet"><span>✓</span> Instant online appointment booking</div>
            <div className="bullet"><span>✓</span> Available across 2+ cities in India</div>
          </div>
        </div>
      </section>

      {/* ── Video Section ── */}
      <section className="about-video">
        <div className="about-video__inner">
          <span className="section-tag reveal">See How It Works</span>
          <h2 className="reveal">Watch our platform in action</h2>
          <p className="reveal">
            See how 100+  patients are finding and booking trusted
            dentists in just minutes using DentistFinder.
          </p>
          <div className="about-video__frame reveal">
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="DentistFinder Platform Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* ── Values Section ── */}
      <section className="about-values">
        <div className="about-values__header">
          <span className="section-tag reveal">What We Stand For</span>
          <h2 className="reveal">Our Core Values</h2>
        </div>
        <div className="about-values__grid">
          {values.map((v, i) => (
            <div className="value-card reveal" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="value-card__icon">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Team Section ── */}
      <section className="about-team">
        <div className="about-team__header">
          <span className="section-tag reveal">The People Behind It</span>
          <h2 className="reveal">Meet Our Team</h2>
          <p className="reveal">
            A passionate group of healthcare professionals and technologists
            working to make dental care better for everyone.
          </p>
        </div>
        <div className="about-team__grid">
          {team.map((member, i) => (
            <div className="team-card reveal" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="team-card__image">
                <img src={member.image} alt={member.name} />
              </div>
              <div className="team-card__info">
                <h3>{member.name}</h3>
                <span>{member.role}</span>
                <p>{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="about-cta">
        <div className="about-cta__inner reveal">
          <h2>Ready to find your perfect dentist?</h2>
          <p>Join over 100+ patients who trust DentistFinder for their dental care.</p>
          <div className="about-cta__buttons">
            <Link to="/register" className="cta-btn cta-btn--primary">Get Started Free</Link>
            <Link to="/dentists" className="cta-btn cta-btn--outline">Browse Dentists</Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutUs;