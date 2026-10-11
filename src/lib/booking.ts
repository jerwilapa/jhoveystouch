export type AppointmentRequest = {
  name: string;
  phone: string;
  service: string;
  services: string[];
  date: string;
  time: string;
  language: "en" | "ar";
};

type ValidationResult =
  | { valid: true; data: AppointmentRequest }
  | { valid: false; message: string };

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const PHONE_PATTERN = /^\+?[0-9()\s-]{8,20}$/;

const messages = {
  en: {
    invalidRequest: "Please check the appointment details.",
    name: "Please enter a name between 2 and 80 characters.",
    phone: "Please enter a valid phone number.",
    service: "Please enter the service you would like.",
    date: "Please choose a valid appointment date.",
    time: "Please choose a valid appointment time.",
    language: "Please refresh the page and try again.",
    future: "Please choose a future date and time.",
  },
  ar: {
    invalidRequest: "يرجى التحقق من تفاصيل الموعد.",
    name: "يرجى إدخال اسم يتراوح بين حرفين و80 حرفًا.",
    phone: "يرجى إدخال رقم هاتف صحيح.",
    service: "يرجى إدخال الخدمة التي ترغبين بها.",
    date: "يرجى اختيار تاريخ موعد صحيح.",
    time: "يرجى اختيار وقت موعد صحيح.",
    language: "يرجى تحديث الصفحة والمحاولة مرة أخرى.",
    future: "يرجى اختيار تاريخ ووقت في المستقبل.",
  },
} as const;

export function validateAppointmentRequest(value: unknown): ValidationResult {
  const isRecord = typeof value === "object" && value !== null && !Array.isArray(value);
  const input = isRecord ? (value as Record<string, unknown>) : {};
  const language = input.language === "ar" ? "ar" : input.language === "en" ? "en" : null;
  const error = messages[language === "ar" ? "ar" : "en"];

  if (!isRecord) return { valid: false, message: error.invalidRequest };

  const name = typeof input.name === "string" ? input.name.trim() : "";
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  const services = Array.isArray(input.services)
    ? input.services.map((service) => (typeof service === "string" ? service.trim() : ""))
    : typeof input.service === "string"
      ? [input.service.trim()]
      : [];
  const service = services.join(", ");
  const date = typeof input.date === "string" ? input.date : "";
  const time = typeof input.time === "string" ? input.time : "";

  if (name.length < 2 || name.length > 80) {
    return { valid: false, message: error.name };
  }
  if (!PHONE_PATTERN.test(phone)) {
    return { valid: false, message: error.phone };
  }
  if (
    services.length < 1 ||
    services.length > 19 ||
    services.some((selected) => selected.length < 2 || selected.length > 100) ||
    new Set(services).size !== services.length
  ) {
    return { valid: false, message: error.service };
  }
  if (!DATE_PATTERN.test(date)) {
    return { valid: false, message: error.date };
  }
  if (!TIME_PATTERN.test(time)) {
    return { valid: false, message: error.time };
  }
  if (!language) {
    return { valid: false, message: error.language };
  }

  const [year, month, day] = date.split("-").map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return { valid: false, message: error.date };
  }

  const riyadhNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" }),
  );
  const todayInRiyadh = [
    riyadhNow.getFullYear(),
    String(riyadhNow.getMonth() + 1).padStart(2, "0"),
    String(riyadhNow.getDate()).padStart(2, "0"),
  ].join("-");
  const currentTimeInRiyadh = `${String(riyadhNow.getHours()).padStart(2, "0")}:${String(
    riyadhNow.getMinutes(),
  ).padStart(2, "0")}`;

  if (date < todayInRiyadh || (date === todayInRiyadh && time <= currentTimeInRiyadh)) {
    return { valid: false, message: error.future };
  }

  return {
    valid: true,
    data: { name, phone, service, services, date, time, language },
  };
}
