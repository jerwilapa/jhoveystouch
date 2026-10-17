import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function GET(request: Request) {
  const month = new URL(request.url).searchParams.get("month") ?? "";
  if (!MONTH_PATTERN.test(month)) {
    return NextResponse.json({ message: "Please request a valid calendar month." }, { status: 400 });
  }

  const [year, monthNumber] = month.split("-").map(Number);
  const firstDay = `${month}-01`;
  const nextMonth = new Date(Date.UTC(year, monthNumber, 1));
  const endDay = `${nextMonth.getUTCFullYear()}-${String(nextMonth.getUTCMonth() + 1).padStart(2, "0")}-01`;

  try {
    const appointments = await getAdminFirestore()
      .collection("appointmentRequests")
      .where("date", ">=", firstDay)
      .where("date", "<", endDay)
      .get();
    const reservedAppointments: {
      date: string;
      time: string;
      durationMinutes: number | null;
    }[] = [];

    for (const appointment of appointments.docs) {
      if (appointment.get("status") === "cancelled") continue;
      const date = appointment.get("date");
      const time = appointment.get("time");
      if (typeof date === "string" && DATE_PATTERN.test(date) && typeof time === "string" && TIME_PATTERN.test(time)) {
        const duration = appointment.get("durationMinutes");
        reservedAppointments.push({
          date,
          time,
          durationMinutes:
            typeof duration === "number" && Number.isFinite(duration) && duration > 0
              ? duration
              : null,
        });
      }
    }

    return NextResponse.json({ appointments: reservedAppointments });
  } catch (error) {
    console.error("Unable to load appointment availability:", error);
    return NextResponse.json(
      { message: "Unable to load appointment availability." },
      { status: 500 },
    );
  }
}
