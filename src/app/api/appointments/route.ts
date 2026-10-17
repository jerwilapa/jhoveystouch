import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";
import {
  appointmentTimesOverlap,
  timeToMinutes,
} from "@/lib/appointment-schedule";
import { sendAppointmentNotification } from "@/lib/appointment-notification";
import { validateAppointmentRequest } from "@/lib/booking";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Please send a valid appointment request." },
      { status: 400 },
    );
  }

  const result = validateAppointmentRequest(body);
  if (!result.valid) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  try {
    const firestore = getAdminFirestore();
    const requests = firestore.collection("appointmentRequests");
    const requestDocument = requests.doc();
    const hasConflict = await firestore.runTransaction(async (transaction) => {
      const sameDate = await transaction.get(
        requests.where("date", "==", result.data.date),
      );
      const requestedStart = timeToMinutes(result.data.time);
      const conflict = sameDate.docs.some((appointment) => {
        if (appointment.get("status") === "cancelled") return false;
        const time = appointment.get("time");
        if (typeof time !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
          return false;
        }
        const duration = appointment.get("durationMinutes");
        const existingDuration =
          typeof duration === "number" && Number.isFinite(duration) && duration > 0
            ? duration
            : result.data.durationMinutes;
        return appointmentTimesOverlap(
          requestedStart,
          result.data.durationMinutes,
          timeToMinutes(time),
          existingDuration,
        );
      });

      if (!conflict) {
        transaction.create(requestDocument, {
          ...result.data,
          status: "pending",
          createdAt: FieldValue.serverTimestamp(),
        });
      }
      return conflict;
    });

    if (hasConflict) {
      return NextResponse.json(
        {
          message:
            result.data.language === "ar"
              ? "يتداخل هذا الوقت مع طلب آخر. يرجى اختيار وقت آخر."
              : "That time overlaps another request. Please choose another time.",
        },
        { status: 409 },
      );
    }

    try {
      await sendAppointmentNotification(result.data);
    } catch (error) {
      console.error(
        "Appointment request was saved, but its email notification failed:",
        error,
      );
    }

    return NextResponse.json({ requestId: requestDocument.id }, { status: 201 });
  } catch (error) {
    console.error("Unable to save appointment request:", error);
    return NextResponse.json(
      {
        message:
          result.data.language === "ar"
            ? "تعذّر إرسال طلبكِ الآن. حاولي مرة أخرى أو تواصلي معنا عبر واتساب."
            : "We couldn't send your request right now. Please try again or contact us on WhatsApp.",
      },
      { status: 500 },
    );
  }
}
