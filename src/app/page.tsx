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
    hairServices: "Hair",
    eyeServices: "Brows & lashes",
    nailServices: "Nails",
    chooseService: "Choose",
    selectedService: "Selected",
    selectMultiple: "You can choose more than one service.",
    selectedCount: "selected",
    serviceRequired: "Please choose at least one service.",
    removeService: "Remove",
    aboutEyebrow: "THE JHOVEY'S TOUCH EXPERIENCE",
    aboutTitle: "Why choose us?",
    aboutDescription:
      "A salon for women, with beauty services for hair, brows, lashes and nails. Tell us what you have in mind and our team will contact you to discuss availability and confirm your visit.",
    progressLabel: "Booking progress",
    detailsStep: "Your details",
    scheduleStep: "Date & time",
    next: "Choose a date & time",
    back: "Back to your details",
    summaryTitle: "Your visit at a glance",
    summaryName: "Booking for",
    summaryService: "Looking for",
    summaryDate: "Preferred date",
    summaryTime: "Preferred time",
    summaryEmpty: "Your selections will appear here.",
    previousMonth: "Previous month",
    nextMonth: "Next month",
    today: "Today",
    dateRequired: "Please choose a date.",
    quickTimes: "Quick time picks",
    timeHint: "Choose a suggested time or enter any time you prefer.",
    name: "Your name",
    namePlaceholder: "e.g. Sara Ahmed",
    phone: "Phone number",
    phonePlaceholder: "+966 5X XXX XXXX",
    service: "What would you like done?",
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
    hairServices: "الشعر",
    eyeServices: "الحواجب والرموش",
    nailServices: "الأظافر",
    chooseService: "اختاري",
    selectedService: "تم الاختيار",
    selectMultiple: "يمكنكِ اختيار أكثر من خدمة.",
    selectedCount: "تم اختيارها",
    serviceRequired: "يرجى اختيار خدمة واحدة على الأقل.",
    removeService: "إزالة",
    aboutEyebrow: "تجربة جهوفي تاتش",
    aboutTitle: "مميزاتنا",
    aboutDescription:
      "صالون نسائي يقدم خدمات للشعر والحواجب والرموش والأظافر. أخبرينا بما ترغبين به وسيتواصل معكِ فريقنا لمناقشة المواعيد المتاحة وتأكيد زيارتكِ.",
    progressLabel: "خطوات حجز الموعد",
    detailsStep: "بياناتكِ",
    scheduleStep: "التاريخ والوقت",
    next: "اختاري التاريخ والوقت",
    back: "العودة إلى بياناتكِ",
    summaryTitle: "ملخص زيارتكِ",
    summaryName: "الحجز لـ",
    summaryService: "الخدمة المطلوبة",
    summaryDate: "التاريخ المناسب",
    summaryTime: "الوقت المناسب",
    summaryEmpty: "ستظهر اختياراتكِ هنا.",
    previousMonth: "الشهر السابق",
    nextMonth: "الشهر التالي",
    today: "اليوم",
    dateRequired: "يرجى اختيار التاريخ.",
    quickTimes: "أوقات مقترحة",
    timeHint: "اختاري وقتًا مقترحًا أو أدخلي الوقت الذي يناسبكِ.",
    name: "الاسم",
    namePlaceholder: "مثال: سارة أحمد",
    phone: "رقم الهاتف",
    phonePlaceholder: "+966 5X XXX XXXX",
    service: "ما الخدمة التي ترغبين بها؟",
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

type ServiceOption = { en: string; ar: string };
type ServiceGroup = { key: "hair" | "eyes" | "nails"; services: ServiceOption[] };

const quickTimePicks = ["09:00", "12:00", "15:00", "18:00"];

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const serviceCatalog: ServiceGroup[] = [
  {
    key: "hair",
    services: [
      { en: "Haircut", ar: "قص شعر" },
      { en: "Blow-dry", ar: "سشوار" },
      { en: "Special occasion hairstyle", ar: "تسريحات المناسبات الخاصة" },
      { en: "Bridal hairstyle", ar: "تسريحات العرائس" },
      { en: "Root touch-up", ar: "صبغ الجذور" },
      { en: "Full hair color", ar: "صبغة كاملة" },
      { en: "Highlights", ar: "هايلايت / لونيات" },
      { en: "Balayage / ombre", ar: "بالياج / أومبري" },
      { en: "Hair treatment", ar: "علاجات الشعر" },
    ],
  },
  {
    key: "eyes",
    services: [
      { en: "Brow shaping & grooming", ar: "تحديد وتشذيب الحواجب" },
      { en: "Brow threading", ar: "تنظيف الحواجب بالخيط" },
      { en: "Brow waxing", ar: "شمع الحواجب" },
      { en: "Brow tint", ar: "صبغ الحواجب" },
      { en: "Eyelash extensions", ar: "تركيب رموش" },
    ],
  },
  {
    key: "nails",
    services: [
      { en: "Classic manicure & pedicure", ar: "مانيكير وباديكير كلاسيك" },
      { en: "Acrylic / gel nail extensions", ar: "تركيب أظافر (أكريليك / جل)" },
      { en: "French manicure & pedicure", ar: "مانيكير وباديكير فرنسي" },
      { en: "Nail art & design", ar: "فن وتصميم الأظافر" },
      { en: "Nail care", ar: "تنظيف الأظافر" },
    ],
  },
];

function FlowerMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" fill="none">
      <path
        d="M24 4.5c4.1 0 6.6 6.1 5.6 11.1 3.6-3.6 10.1-5.3 12.9-2.4 2.9 2.8 1.2 9.3-2.4 12.9 5-1 11.1 1.5 11.1 5.6s-6.1 6.6-11.1 5.6c3.6 3.6 5.3 10.1 2.4 12.9-2.8 2.9-9.3 1.2-12.9-2.4 1 5-1.5 11.1-5.6 11.1s-6.6-6.1-5.6-11.1c-3.6 3.6-10.1 5.3-12.9 2.4-2.9-2.8-1.2-9.3 2.4-12.9-5 1-11.1-1.5-11.1-5.6s6.1-6.6 11.1-5.6C4.3 22.5 2.6 16 5.5 13.2c2.8-2.9 9.3-1.2 12.9 2.4C17.4 10.6 19.9 4.5 24 4.5Z"
        transform="translate(0 -4)"
        fill="currentColor"
      />
      <circle cx="24" cy="24" r="6.5" fill="var(--paper)" />
    </svg>
  );
}

function WomanProfileMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 72 72" fill="none">
      <path
        d="M48.3 8.6c-12.5-2.9-25.3 3.4-30.6 14.7-3.4 7.1-1.7 12.7-5 18.2-3.2 5.4-1.4 11 4.4 13.2-1.6 4.2-.2 8 3.8 9.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
      <path
        d="M46.7 17.1c7.2.6 11.8 5.4 11.8 12.1 0 2.8 1.1 4.8 3.6 7.1 1.2 1.1.9 2.4-.8 3.3l-2.7 1.5 1.7 1.9c1 1.1.7 2.6-.5 3.6l-1.6 1.4c-.5 4.7-3.5 7.6-9.1 8.5L48 67.7M34.1 57.7c-4.5-4.1-6.5-9.7-6-16.3.7-10.7 7.4-19.7 18.6-23.3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M18.6 35.9c2.8-14 12.1-22 23.8-21.9 5.2 0 9.7 1.8 13.4 5.4-7-2.7-13.3-1.6-18.4 2.8-4.3 3.7-6.6 8.7-11.1 12.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
      <path
        d="M24.6 61.8c2.9 4 7.2 7.2 13 9.6m10.6-6.1c5.8-1.4 9-5.2 9.6-11.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.1"
      />
      <path
        d="M25.1 27.4c4.4-6.4 10.6-10.1 18.1-10.3"
        stroke="#8ebeb8"
        strokeLinecap="round"
        strokeWidth="1.2"
      />
      <circle cx="53.2" cy="47.1" r="1.7" fill="#c98c82" />
      <path
        d="M34.1 57.7c3.1 2.5 7.1 3.5 11.6 2.7"
        stroke="#8ebeb8"
        strokeLinecap="round"
        strokeWidth="1.2"
      />
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
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [today, setToday] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [calendarMonth, setCalendarMonth] = useState("");
  const [details, setDetails] = useState({
    name: "",
    phone: "",
    services: [] as string[],
    date: "",
    time: "",
  });
  const t = copy[language];
  const direction = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [direction, language]);

  useEffect(() => {
    if (step === 2) document.getElementById("date-picker-title")?.focus();
  }, [step]);

  useEffect(() => {
    const riyadhNow = new Date();
    const dateParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Riyadh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(riyadhNow);
    const timeParts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Riyadh",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(riyadhNow);

    const riyadhToday = dateKey(
      Number(dateParts.find((part) => part.type === "year")?.value),
      Number(dateParts.find((part) => part.type === "month")?.value),
      Number(dateParts.find((part) => part.type === "day")?.value),
    );
    setToday(riyadhToday);
    setCalendarMonth(riyadhToday.slice(0, 7));
    setCurrentTime(
      `${timeParts.find((part) => part.type === "hour")?.value}:${timeParts.find((part) => part.type === "minute")?.value}`,
    );
  }, []);

  function updateDetail(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.currentTarget;
    setDetails((current) => ({ ...current, [name]: value }));
  }

  function changeCalendarMonth(offset: number) {
    const [year, month] = (calendarMonth || today.slice(0, 7)).split("-").map(Number);
    const target = new Date(year, month - 1 + offset, 1);
    setCalendarMonth(`${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}`);
  }

  function selectDate(date: string) {
    setDetails((current) => ({ ...current, date }));
    setError("");
  }

  function changeLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
  }

  function serviceGroupTitle(key: (typeof serviceCatalog)[number]["key"]) {
    if (key === "hair") return t.hairServices;
    if (key === "eyes") return t.eyeServices;
    return t.nailServices;
  }

  function toggleService(service: ServiceOption) {
    setError("");
    setDetails((current) => ({
      ...current,
      services: current.services.includes(service.en)
        ? current.services.filter((selected) => selected !== service.en)
        : [...current.services, service.en],
    }));
  }

  function getServiceLabel(serviceId: string) {
    const service = serviceCatalog
      .flatMap((group) => group.services)
      .find((item) => item.en === serviceId);
    return service ? service[language] : serviceId;
  }

  function removeService(serviceId: string) {
    setError("");
    setDetails((current) => ({
      ...current,
      services: current.services.filter((selected) => selected !== serviceId),
    }));
  }

  function formatSummaryDate(date: string) {
    if (!date) return "";
    const [year, month, day] = date.split("-").map(Number);
    return new Intl.DateTimeFormat(language === "ar" ? "ar-SA" : "en-US", {
      calendar: "gregory",
      dateStyle: "full",
      timeZone: "Asia/Riyadh",
    }).format(new Date(Date.UTC(year, month - 1, day, 12)));
  }

  function formatCalendarMonth(month: string) {
    if (!month) return "";
    const [year, monthNumber] = month.split("-").map(Number);
    return new Intl.DateTimeFormat(language === "ar" ? "ar-SA" : "en-US", {
      calendar: "gregory",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
  }

  const visibleCalendarMonth = calendarMonth || today.slice(0, 7);
  const [visibleYear, visibleMonth] = visibleCalendarMonth.split("-").map(Number);
  const visibleMonthDate = visibleCalendarMonth
    ? new Date(visibleYear, visibleMonth - 1, 1)
    : new Date();
  const firstWeekday = visibleMonthDate.getDay();
  const daysInVisibleMonth = visibleCalendarMonth
    ? new Date(visibleYear, visibleMonth, 0).getDate()
    : 0;
  const calendarCells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInVisibleMonth }, (_, index) => index + 1),
  ];
  const weekdayLabels = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(language === "ar" ? "ar-SA" : "en-US", {
      weekday: "short",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(2024, 0, 7 + index))),
  );

  function formatSummaryTime(time: string) {
    if (!time) return "";
    const [hour, minute] = time.split(":").map(Number);
    return new Intl.DateTimeFormat(language === "ar" ? "ar-SA" : "en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(2024, 0, 1, hour, minute)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const activeFields = form.querySelectorAll<HTMLInputElement>(
      `[data-step="${step}"] input`,
    );
    const firstInvalidField = Array.from(activeFields).find((field) => !field.checkValidity());
    if (firstInvalidField) {
      firstInvalidField.reportValidity();
      return;
    }

    if (step === 1) {
      if (details.services.length === 0) {
        setError(t.serviceRequired);
        return;
      }
      setStep(2);
      return;
    }

    if (!details.date) {
      setError(t.dateRequired);
      document.querySelector<HTMLButtonElement>(".calendar-day:not(:disabled)")?.focus();
      return;
    }

    setSubmitting(true);
    const appointment = {
      name: details.name,
      phone: details.phone,
      service: details.services.map(getServiceLabel).join(", "),
      services: details.services.map(getServiceLabel),
      date: details.date,
      time: details.time,
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
    <main className="page" id="top" dir={direction}>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Jhovey's Touch home">
          <span className="brand-mark"><WomanProfileMark /></span>
          <span className="brand-name">
            <span className="brand-script">Jhovey&apos;s Touch</span>
            <span className="brand-sub">Salon for Women</span>
          </span>
        </a>
        <div className="header-actions">
          <div className="language-switch" aria-label="Choose language">
            <button
              className={language === "en" ? "language-active" : ""}
              type="button"
              onClick={() => changeLanguage("en")}
              aria-pressed={language === "en"}
            >
              EN
            </button>
            <span aria-hidden="true">/</span>
            <button
              className={language === "ar" ? "language-active" : ""}
              type="button"
              onClick={() => changeLanguage("ar")}
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

      <section className="booking-layout" id="book">
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

        <section className="form-panel" aria-labelledby="form-title">
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
              <div className="booking-progress" role="group" aria-label={t.progressLabel}>
                <button
                  className={`progress-step${step === 1 ? " progress-active" : " progress-complete"}`}
                  type="button"
                  aria-current={step === 1 ? "step" : undefined}
                  onClick={() => {
                    setStep(1);
                    setError("");
                  }}
                >
                  <span className="progress-number">{step > 1 ? "✓" : "01"}</span>
                  <span>{t.detailsStep}</span>
                </button>
                <span className={`progress-track${step === 2 ? " progress-track-active" : ""}`} />
                <button
                  className={`progress-step${step === 2 ? " progress-active" : ""}`}
                  type="button"
                  aria-current={step === 2 ? "step" : undefined}
                  disabled={step === 1}
                  onClick={() => setStep(2)}
                >
                  <span className="progress-number">02</span>
                  <span>{t.scheduleStep}</span>
                </button>
              </div>
              <form className="booking-form" onSubmit={handleSubmit} noValidate>
                <div className="step-content details-step-content" data-step="1" hidden={step !== 1}>
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
                      value={details.name}
                      onChange={updateDetail}
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
                      value={details.phone}
                      onChange={updateDetail}
                    />
                  </div>
                  <div className="field service-field">
                    <span className="field-label">{t.service}</span>
                    <p className="service-picker-hint">{t.selectMultiple}</p>
                    <div className="booking-service-groups">
                      {serviceCatalog.map((group, index) => (
                        <section className="service-group" key={group.key} aria-labelledby={`booking-service-group-${group.key}`}>
                          <div className="service-group-heading">
                            <span className="service-group-number">0{index + 1}</span>
                            <h3 id={`booking-service-group-${group.key}`}>{serviceGroupTitle(group.key)}</h3>
                            <span className="service-group-count">{String(group.services.length).padStart(2, "0")}</span>
                          </div>
                          <div className="service-options">
                            {group.services.map((service) => {
                              const label = language === "ar" ? service.ar : service.en;
                              const isSelected = details.services.includes(service.en);
                              return (
                                <button
                                  className={`service-option${isSelected ? " service-option-selected" : ""}`}
                                  type="button"
                                  key={service.en}
                                  aria-pressed={isSelected}
                                  onClick={() => toggleService(service)}
                                >
                                  <span>{label}</span>
                                  <span className="service-option-action">
                                    {isSelected ? t.selectedService : t.chooseService}
                                    <span aria-hidden="true">{isSelected ? "✓" : "+"}</span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </section>
                      ))}
                    </div>
                    {details.services.length > 0 && (
                      <div className="selected-services" aria-label={t.selectedService}>
                        {details.services.map((serviceId) => (
                          <span className="selected-service" key={serviceId}>
                            {getServiceLabel(serviceId)}
                            <button
                              type="button"
                              aria-label={`${t.removeService}: ${getServiceLabel(serviceId)}`}
                              onClick={() => removeService(serviceId)}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <span className="selected-count">
                          {details.services.length} {t.selectedCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="step-content" data-step="2" hidden={step !== 2}>
                  <div className="schedule-picker-grid">
                    <section className="calendar-card" aria-label={t.date}>
                      <div className="calendar-header">
                        <button
                          className="calendar-nav"
                          type="button"
                          aria-label={t.previousMonth}
                          disabled={!today || visibleCalendarMonth <= today.slice(0, 7)}
                          onClick={() => changeCalendarMonth(-1)}
                        >
                          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                            <path d="m12 4-6 6 6 6" stroke="currentColor" strokeWidth="1.6" />
                          </svg>
                        </button>
                        <h3 id="date-picker-title" tabIndex={-1}>{formatCalendarMonth(visibleCalendarMonth)}</h3>
                        <button
                          className="calendar-nav"
                          type="button"
                          aria-label={t.nextMonth}
                          disabled={!today}
                          onClick={() => changeCalendarMonth(1)}
                        >
                          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                            <path d="m8 4 6 6-6 6" stroke="currentColor" strokeWidth="1.6" />
                          </svg>
                        </button>
                      </div>
                      <button
                        className="calendar-today"
                        type="button"
                        disabled={!today}
                        onClick={() => {
                          setCalendarMonth(today.slice(0, 7));
                          selectDate(today);
                        }}
                      >
                        {t.today}
                      </button>
                      <div className="calendar-weekdays" aria-hidden="true">
                        {weekdayLabels.map((weekday, index) => (
                          <span key={`${weekday}-${index}`}>{weekday}</span>
                        ))}
                      </div>
                      <div className="calendar-days" role="group" aria-label={t.date}>
                        {calendarCells.map((day, index) => {
                          if (day === null) {
                            return <span className="calendar-empty" key={`empty-${index}`} aria-hidden="true" />;
                          }
                          const date = dateKey(visibleYear, visibleMonth, day);
                          const isSelected = details.date === date;
                          const isToday = today === date;
                          return (
                            <button
                              className={`calendar-day${isSelected ? " calendar-day-selected" : ""}${isToday ? " calendar-day-today" : ""}`}
                              type="button"
                              key={date}
                              aria-label={formatSummaryDate(date)}
                              aria-pressed={isSelected}
                              disabled={!today || date < today}
                              onClick={() => selectDate(date)}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </section>
                    <div className="field">
                      <label htmlFor="time">{t.time}</label>
                      <div className="time-input-wrap">
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M12 7v5l3.2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <input
                          id="time"
                          name="time"
                          type="time"
                          required
                          min={details.date === today ? currentTime : undefined}
                          value={details.time}
                          onChange={updateDetail}
                        />
                      </div>
                      <p className="time-picker-hint">{t.timeHint}</p>
                      <div className="time-quick-picks" role="group" aria-label={t.quickTimes}>
                        {quickTimePicks.map((time) => (
                          <button
                            className={`time-quick-pick${details.time === time ? " time-quick-pick-selected" : ""}`}
                            type="button"
                            key={time}
                            aria-pressed={details.time === time}
                            disabled={details.date === today && time <= currentTime}
                            onClick={() => {
                              setError("");
                              setDetails((current) => ({ ...current, time }));
                            }}
                          >
                            {formatSummaryTime(time)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="appointment-summary" aria-live="polite">
                    <div className="summary-heading">
                      <span className="summary-flower"><FlowerMark /></span>
                      <p>{t.summaryTitle}</p>
                    </div>
                    <div className="summary-detail">
                      <span>{t.summaryName}</span>
                      <strong className={!details.name ? "summary-placeholder" : undefined}>
                        {details.name || t.summaryEmpty}
                      </strong>
                    </div>
                    <div className="summary-detail summary-service-detail">
                      <span>{t.summaryService}</span>
                      {details.services.length > 0 ? (
                        <div className="summary-service-list">
                          {details.services.map((serviceId) => (
                            <strong key={serviceId}>{getServiceLabel(serviceId)}</strong>
                          ))}
                        </div>
                      ) : (
                        <strong className="summary-placeholder">{t.summaryEmpty}</strong>
                      )}
                    </div>
                    <div className="summary-detail">
                      <span>{t.summaryDate}</span>
                      <strong className={!details.date ? "summary-placeholder" : undefined}>
                        {formatSummaryDate(details.date) || t.summaryEmpty}
                      </strong>
                    </div>
                    <div className="summary-detail">
                      <span>{t.summaryTime}</span>
                      <strong className={!details.time ? "summary-placeholder" : undefined}>
                        {formatSummaryTime(details.time) || t.summaryEmpty}
                      </strong>
                    </div>
                  </div>
                </div>
                {error && <p className="form-error" role="alert">{error}</p>}
                <div className="form-actions">
                  {step === 2 && (
                    <button
                      className="back-button"
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setError("");
                      }}
                    >
                      <span aria-hidden="true"><ArrowIcon /></span>
                      {t.back}
                    </button>
                  )}
                  <button className="submit-button" type="submit" disabled={submitting}>
                    {submitting ? t.submitting : step === 1 ? t.next : t.submit}
                    {!submitting && <span aria-hidden="true"><ArrowIcon /></span>}
                  </button>
                </div>
                <p className="form-consent">{t.consent}</p>
              </form>
            </>
          )}
        </section>
      </section>

      <section className="services-section" id="services">
        <aside className="about-banner">
          <div className="about-mark"><FlowerMark /></div>
          <div>
            <p className="about-eyebrow">{t.aboutEyebrow}</p>
            <h3>{t.aboutTitle}</h3>
            <p className="about-description">{t.aboutDescription}</p>
          </div>
          <a className="about-cta" href="#book">
            {t.navBook}<span aria-hidden="true"><ArrowIcon /></span>
          </a>
        </aside>
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
