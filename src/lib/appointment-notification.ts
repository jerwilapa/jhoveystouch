import type { AppointmentRequest } from "@/lib/booking";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getLogoUrl(): string | null {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL;

  if (!configuredUrl) return null;

  const url = new URL(
    configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`,
  );
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("The site URL for the appointment email logo must use HTTP or HTTPS.");
  }

  return new URL("/jhoveystouchlogo.png", url).toString();
}

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

  const name = escapeHtml(appointment.name);
  const phone = escapeHtml(appointment.phone);
  const service = escapeHtml(appointment.service);
  const date = escapeHtml(appointment.date);
  const time = escapeHtml(appointment.time);
  const phoneNumber = appointment.phone.replace(/[^\d+]/g, "");
  const phoneLink = `tel:${phoneNumber}`;
  const internationalPhone = phoneNumber.startsWith("+")
    ? phoneNumber.slice(1)
    : phoneNumber.startsWith("00")
      ? phoneNumber.slice(2)
      : null;
  const whatsappLink =
    internationalPhone && internationalPhone.length >= 8 && internationalPhone.length <= 15
      ? `https://wa.me/${internationalPhone}`
      : null;
  const logoUrl = getLogoUrl();

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
      html: `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f5f2ed;color:#24211d;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">New appointment request from ${name} for ${date} at ${time}.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f2ed;padding:32px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e8e1d7;border-radius:16px;overflow:hidden;">
          <tr><td align="center" style="padding:28px 24px 20px;">
            ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" width="112" height="112" alt="Jhovey's Touch Salon" style="display:block;width:112px;height:112px;object-fit:contain;margin:0 auto 14px;border:0;" />` : ""}
            <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#a7782e;">Jhovey's Touch Salon</div>
            <div style="margin-top:18px;display:inline-block;padding:7px 12px;border-radius:20px;background:#f5efe3;color:#8a6227;font-size:11px;font-weight:bold;letter-spacing:1px;">NEW APPOINTMENT REQUEST</div>
          </td></tr>
          <tr><td style="padding:0 28px 26px;">
            <h1 style="margin:0 0 8px;text-align:center;font-size:24px;line-height:1.3;color:#24211d;">A new request is waiting</h1>
            <p style="margin:0 0 22px;text-align:center;font-size:14px;line-height:1.6;color:#716b63;">Review the details and contact the customer to confirm.</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#faf8f5;border-radius:10px;">
              <tr><td style="padding:14px 16px;border-bottom:1px solid #eee8df;color:#81796f;font-size:12px;">CUSTOMER</td><td align="right" style="padding:14px 16px;border-bottom:1px solid #eee8df;color:#24211d;font-size:14px;font-weight:bold;">${name}</td></tr>
              <tr><td style="padding:14px 16px;border-bottom:1px solid #eee8df;color:#81796f;font-size:12px;">PHONE</td><td align="right" style="padding:14px 16px;border-bottom:1px solid #eee8df;font-size:14px;"><a href="${phoneLink}" style="color:#8a6227;text-decoration:none;">${phone}</a></td></tr>
              <tr><td style="padding:14px 16px;border-bottom:1px solid #eee8df;color:#81796f;font-size:12px;">SERVICE</td><td align="right" style="padding:14px 16px;border-bottom:1px solid #eee8df;color:#24211d;font-size:14px;">${service}</td></tr>
              <tr><td style="padding:14px 16px;color:#81796f;font-size:12px;">DATE &amp; TIME</td><td align="right" style="padding:14px 16px;color:#24211d;font-size:14px;font-weight:bold;">${date} at ${time}</td></tr>
            </table>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:22px;">
              <tr>
                <td align="center" style="padding:0 5px 10px;"><a href="${phoneLink}" style="display:inline-block;min-width:150px;padding:13px 18px;border-radius:7px;background:#a7782e;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;">Call customer</a></td>
                ${whatsappLink ? `<td align="center" style="padding:0 5px 10px;"><a href="${escapeHtml(whatsappLink)}" style="display:inline-block;min-width:150px;padding:13px 18px;border-radius:7px;background:#276c4b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;">Message on WhatsApp</a></td>` : ""}
              </tr>
            </table>
            <p style="margin:12px 0 0;text-align:center;font-size:12px;line-height:1.6;color:#81796f;">This is a request, not a confirmed appointment. Please confirm the time with the customer.</p>
          </td></tr>
          <tr><td align="center" style="padding:16px;border-top:1px solid #eee8df;color:#9a9288;font-size:11px;">Jhovey's Touch · A little time for you</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`,
      text: [
        "A new appointment request is waiting for confirmation.",
        "",
        `Name: ${appointment.name}`,
        `Phone: ${appointment.phone}`,
        `Services: ${appointment.service}`,
        `Date: ${appointment.date}`,
        `Time: ${appointment.time}`,
        "",
        `Call customer: ${phoneLink}`,
        ...(whatsappLink ? [`Message on WhatsApp: ${whatsappLink}`] : []),
        "",
        "This is a request, not a confirmed appointment.",
      ].join("\n"),
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Email provider returned HTTP ${response.status}.`);
  }
}
