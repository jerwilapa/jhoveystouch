import type { AppointmentRequest } from "@/lib/booking";

export async function sendAppointmentNotification(
  appointment: AppointmentRequest,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.APPOINTMENT_NOTIFICATION_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey && !to && !from) return;
  if (!apiKey || !to || !from) {
    throw new Error("Appointment email notification configuration is incomplete.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `New appointment request - ${appointment.date} ${appointment.time}`,
      text: [
        "A new appointment request was submitted.",
        "",
        `Name: ${appointment.name}`,
        `Phone: ${appointment.phone}`,
        `Services: ${appointment.service}`,
        `Date: ${appointment.date}`,
        `Time: ${appointment.time}`,
      ].join("\n"),
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Email provider returned HTTP ${response.status}.`);
  }
}
