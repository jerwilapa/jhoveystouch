"use client";

import { FormEvent, useEffect, useState } from "react";

type Language = "en" | "ar";

const copy = {
  en: {
    navBook: "BOOK YOUR VISIT",
    eyebrow: "A SALON FOR WOMEN",
    artAlt: "A calm, welcoming salon interior",
    headline: "A little time,",
    headlineAccent: "just for you.",
    intro:
      "Your moment to unwind is just around the corner. Tell us what you have in mind and we'll be in touch to confirm your visit.",
    note: "Every visit begins with you.",
    formEyebrow: "YOUR NEXT VISIT",
    formTitle: "Request an appointment",
    formDescription: "Share a few details and our team will get back to you.",
    name: "Your name",
    namePlaceholder: "e.g. Sara Ahmed",
    phone: "Phone number",
    phonePlaceholder: "+966 5X XXX XXXX",
    service: "What would you like done?",
    servicePlaceholder: "Tell us the service you're interested in",
    date: "Preferred date",
    time: "Preferred time",
    submit: "Send appointment request",
    submitting: "Sending your request...",
    consent: "Your appointment is a request, not a confirmed booking. We'll contact you to confirm availability.",
    required: "All fields are required.",
    successTitle: "Request received",
    successMessage:
      "Thank you! Our team will contact you to confirm your appointment. We look forward to seeing you.",
    another: "Make another request",
    error: "We couldn't send your request. Please try again or reach us on WhatsApp.",
    contact: "WE'D LOVE TO HEAR FROM YOU",
    follow: "Follow along",
    footer: "A moment to feel like yourself.",
    wa: "Chat with us on WhatsApp",
  },
  ar: {
    navBook: "احجزي موعدك",
    eyebrow: "صالون نسائي",
    artAlt: "مساحة هادئة ومرحّبة في الصالون",
    headline: "لحظات من أجلكِ،",
    headlineAccent: "كما تستحقين.",
    intro:
      "لحظتكِ للاسترخاء أقرب مما تتخيلين. أخبرينا بما ترغبين به وسنتواصل معكِ لتأكيد موعدكِ.",
    note: "كل زيارة تبدأ بكِ.",
    formEyebrow: "زيارتكِ القادمة",
    formTitle: "اطلبي موعدًا",
    formDescription: "أخبرينا ببعض التفاصيل وسيتواصل معكِ فريقنا.",
    name: "الاسم",
    namePlaceholder: "مثال: سارة أحمد",
    phone: "رقم الهاتف",
    phonePlaceholder: "+966 5X XXX XXXX",
    service: "ما الخدمة التي ترغبين بها؟",
    servicePlaceholder: "أخبرينا بالخدمة التي تهمكِ",
    date: "التاريخ المناسب",
    time: "الوقت المناسب",
    submit: "إرسال طلب الموعد",
    submitting: "جارٍ إرسال طلبكِ...",
    consent: "طلب الموعد غير مؤكد حتى الآن. سنتواصل معكِ لتأكيد التوفر.",
    required: "جميع الحقول مطلوبة.",
    successTitle: "تم استلام طلبكِ",
    successMessage: "شكرًا لكِ! سيتواصل معكِ فريقنا لتأكيد الموعد. نتطلع إلى رؤيتكِ.",
    another: "طلب موعد آخر",
    error: "تعذّر إرسال طلبكِ. حاولي مرة أخرى أو تواصلي معنا عبر واتساب.",
    contact: "يسعدنا تواصلكِ معنا",
    follow: "تابعينا",
    footer: "لحظة تشبهكِ.",
    wa: "تواصلي معنا عبر واتساب",
  },
} as const;

function FlowerMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" fill="none">
      <path
        d="M24 4.5c4.1 0 6.6 6.1 5.6 11.1 3.6-3.6 10.1-5.3 12.9-2.4 2.9 2.8 1.2 9.3-2.4 12.9 5-1 11.1 1.5 11.1 5.6s-6.1 6.6-11.1 5.6c3.6 3.6 5.3 10.1 2.4 12.9-2.8 2.9-9.3 1.2-12.9-2.4 1 5-1.5 11.1-5.6 11.1s-6.6-6.1-5.6-11.1c-3.6 3.6-10.1 5.3-12.9 2.4-2.9-2.8-1.2-9.3 2.4-12.9-5 1-11.1-1.5-11.1-5.6s6.1-6.6 11.1-5.6C4.3 22.5 2.6 16 5.5 13.2c2.8-2.9 9.3-1.2 12.9 2.4C17.4 10.6 19.9 4.5 24 4.5Z"
        transform="translate(0 -4)"
        fill="currentColor"
      />
      <circle cx="24" cy="24" r="6.5" fill="#FBF8F3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M4.2 10h11.6m-4.7-4.7 4.7 4.7-4.7 4.7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const t = copy[language];
  const direction = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [direction, language]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const appointment = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      service: formData.get("service"),
      date: formData.get("date"),
      time: formData.get("time"),
      language,
    };

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointment),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(result.message || t.error);
        return;
      }
      setSubmitted(true);
    } catch {
      setError(t.error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page" dir={direction}>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Jhovey's Touch home">
          <span className="brand-mark"><FlowerMark /></span>
          <span className="brand-name">
            <span>JHOVEY&apos;S</span>
            <span className="brand-sub">T O U C H</span>
          </span>
        </a>
        <div className="header-actions">
          <div className="language-switch" aria-label="Choose language">
            <button
              className={language === "en" ? "language-active" : ""}
              type="button"
              onClick={() => setLanguage("en")}
              aria-pressed={language === "en"}
            >
              EN
            </button>
            <span aria-hidden="true">/</span>
            <button
              className={language === "ar" ? "language-active" : ""}
              type="button"
              onClick={() => setLanguage("ar")}
              aria-pressed={language === "ar"}
            >
              ع
            </button>
          </div>
          <a className="header-link" href="#book">
            {t.navBook}<span aria-hidden="true"><ArrowIcon /></span>
          </a>
        </div>
      </header>

      <section className="booking-layout" id="top">
        <div className="welcome-panel">
          <div className="welcome-copy">
            <p className="eyebrow"><span />{t.eyebrow}</p>
            <h1>{t.headline}<br /><em>{t.headlineAccent}</em></h1>
            <p className="welcome-description">{t.intro}</p>
          </div>
          <div className="welcome-art" role="img" aria-label={t.artAlt}>
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-sun" />
            <div className="art-leaf leaf-one" />
            <div className="art-leaf leaf-two" />
            <div className="art-leaf leaf-three" />
            <div className="art-vase" />
            <div className="art-line" />
            <div className="art-caption"><span>01</span>{t.note}</div>
          </div>
          <div className="welcome-footer">
            <span className="footer-rule" />
            <span>{t.footer}</span>
            <span className="footer-rule" />
          </div>
        </div>

        <section className="form-panel" id="book" aria-labelledby="form-title">
          {submitted ? (
            <div className="success-state" role="status">
              <span className="success-icon" aria-hidden="true">✓</span>
              <p className="form-eyebrow">{t.formEyebrow}</p>
              <h2 id="form-title">{t.successTitle}</h2>
              <p className="form-description">{t.successMessage}</p>
              <a
                className="whatsapp-button"
                href={`https://wa.me/966534891653?text=${encodeURIComponent(
                  language === "ar"
                    ? "مرحبًا، أود متابعة طلب موعدي لدى جهوفي تاتش."
                    : "Hello, I'd like to follow up on my appointment request at Jhovey's Touch.",
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                {t.wa}<span aria-hidden="true"><ArrowIcon /></span>
              </a>
              <button className="text-button" type="button" onClick={() => setSubmitted(false)}>
                {t.another}
              </button>
            </div>
          ) : (
            <>
              <div className="form-heading">
                <p className="form-eyebrow">{t.formEyebrow}</p>
                <h2 id="form-title">{t.formTitle}</h2>
                <p className="form-description">{t.formDescription}</p>
              </div>
              <form className="booking-form" onSubmit={handleSubmit}>
                <div className="field">
                  <label htmlFor="name">{t.name}</label>
                  <input
                    autoComplete="name"
                    id="name"
                    name="name"
                    placeholder={t.namePlaceholder}
                    required
                    minLength={2}
                    maxLength={80}
                  />
                </div>
                <div className="field">
                  <label htmlFor="phone">{t.phone}</label>
                  <input
                    autoComplete="tel"
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder={t.phonePlaceholder}
                    required
                    minLength={8}
                    maxLength={20}
                  />
                </div>
                <div className="field">
                  <label htmlFor="service">{t.service}</label>
                  <input
                    id="service"
                    name="service"
                    placeholder={t.servicePlaceholder}
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="date">{t.date}</label>
                    <input id="date" name="date" type="date" required />
                  </div>
                  <div className="field">
                    <label htmlFor="time">{t.time}</label>
                    <input id="time" name="time" type="time" required />
                  </div>
                </div>
                {error && <p className="form-error" role="alert">{error}</p>}
                <button className="submit-button" type="submit" disabled={submitting}>
                  {submitting ? t.submitting : t.submit}
                  {!submitting && <span aria-hidden="true"><ArrowIcon /></span>}
                </button>
                <p className="form-consent">{t.consent}</p>
              </form>
            </>
          )}
        </section>
      </section>

      <footer className="contact-footer">
        <div className="contact-intro">
          <FlowerMark />
          <span>{t.contact}</span>
        </div>
        <div className="contact-links">
          <a href="tel:+966534891653">+966 53 489 1653</a>
          <span className="contact-divider" />
          <a href="tel:+966539575736">+966 53 957 5736</a>
          <span className="contact-divider" />
          <a href="https://www.instagram.com/Jhoveystouch" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href="https://www.snapchat.com/add/Jhoveyssalon" target="_blank" rel="noreferrer">
            Snapchat
          </a>
        </div>
        <a className="follow-link" href="https://wa.me/966534891653" target="_blank" rel="noreferrer">
          {t.follow}<span aria-hidden="true"><ArrowIcon /></span>
        </a>
      </footer>
    </main>
  );
}
