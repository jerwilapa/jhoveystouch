import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import {
  appointmentTimesOverlap,
  timeToMinutes,
} from "@/lib/appointment-schedule";
import { hasValidAdminSession } from "@/lib/admin-auth";
import {
  isResendTestSenderLimitedToSalonEmail,
  sendAppointmentConfirmation,
} from "@/lib/appointment-notification";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { getAppointmentDuration } from "@/lib/service-durations";

export const runtime = "nodejs";

const STATUSES = ["pending", "confirmed", "cancelled"] as const;
type AppointmentStatus = (typeof STATUSES)[number];

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/admin/appointments/[id]">,
) {
  try {
    if (!hasValidAdminSession(request)) {
      return NextResponse.json({ message: "Please sign in to update requests." }, { status: 401 });
    }

    const { id } = await context.params;
    if (!/^[A-Za-z0-9_-]{1,150}$/.test(id)) {
      return NextResponse.json({ message: "Invalid appointment request." }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Please choose a valid status." }, { status: 400 });
    }

    const status =
      typeof body === "object" && body !== null && "status" in body
        ? body.status
        : undefined;
    const resendConfirmation =
      typeof body === "object" &&
      body !== null &&
      "resendConfirmation" in body &&
      body.resendConfirmation === true;
    if (
      typeof status !== "string" ||
      !STATUSES.includes(status as AppointmentStatus) ||
      (resendConfirmation && status !== "confirmed")
    ) {
      return NextResponse.json({ message: "Please choose a valid status." }, { status: 400 });
    }

    const firestore = getAdminFirestore();
    const appointments = firestore.collection("appointmentRequests");
    const appointment = appointments.doc(id);
    const result = await firestore.runTransaction(async (transaction) => {
      const existing = await transaction.get(appointment);
      if (!existing.exists) return "not-found";

      const currentStatus = existing.get("status");
      const data = existing.data()!;
      const currentDate = existing.get("date");
      const currentTime = existing.get("time");
      const currentDuration = existing.get("durationMinutes");
      const serviceIds = existing.get("serviceIds");
      const legacyDuration =
        Array.isArray(serviceIds) &&
        serviceIds.every((serviceId) => typeof serviceId === "string")
          ? getAppointmentDuration(serviceIds)
          : null;
      if (
        status !== "cancelled" &&
        currentStatus === "cancelled" &&
        typeof currentDate === "string" &&
        typeof currentTime === "string" &&
        /^([01]\d|2[0-3]):[0-5]\d$/.test(currentTime)
      ) {
        const sameDate = await transaction.get(
          appointments.where("date", "==", currentDate),
        );
        const requestedStart = timeToMinutes(currentTime);
        const requestedDuration =
          typeof currentDuration === "number" &&
          Number.isFinite(currentDuration) &&
          currentDuration > 0
            ? currentDuration
            : legacyDuration ?? 60;
        const hasConflict = sameDate.docs.some((other) => {
          if (other.id === id || other.get("status") === "cancelled") return false;
          const otherTime = other.get("time");
          if (
            typeof otherTime !== "string" ||
            !/^([01]\d|2[0-3]):[0-5]\d$/.test(otherTime)
          ) {
            return false;
          }
          const otherDuration = other.get("durationMinutes");
          return appointmentTimesOverlap(
            requestedStart,
            requestedDuration,
            timeToMinutes(otherTime),
            typeof otherDuration === "number" &&
              Number.isFinite(otherDuration) &&
              otherDuration > 0
              ? otherDuration
              : requestedDuration,
          );
        });
        if (hasConflict) return "conflict";
      }

      transaction.update(appointment, {
        status: status as AppointmentStatus,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return {
        status: "updated" as const,
        confirmation:
          status === "confirmed" &&
          (currentStatus !== "confirmed" || resendConfirmation)
            ? {
                name: typeof data.name === "string" ? data.name : "",
                email: typeof data.email === "string" ? data.email : "",
                service:
                  typeof data.service === "string"
                    ? data.service
                    : Array.isArray(data.services)
                      ? data.services
                          .filter((service: unknown) => typeof service === "string")
                          .join(", ")
                      : "",
                date: typeof data.date === "string" ? data.date : "",
                time: typeof data.time === "string" ? data.time : "",
                language: data.language === "ar" ? "ar" as const : "en" as const,
              }
            : null,
      };
    });

    if (result === "not-found") {
      return NextResponse.json({ message: "Appointment request not found." }, { status: 404 });
    }
    if (result === "conflict") {
      return NextResponse.json(
        { message: "This request overlaps an active request and cannot be reopened." },
        { status: 409 },
      );
    }
    let emailNotification: "sent" | "failed" | "missing_email" | "test_sender_restricted" | "not_applicable" =
      "not_applicable";
    if (typeof result !== "string" && result.confirmation) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.confirmation.email)) {
        emailNotification = "missing_email";
        console.error(
          "Appointment was confirmed, but no valid customer email is available for notification.",
          { appointmentId: id },
        );
      } else if (isResendTestSenderLimitedToSalonEmail(result.confirmation.email)) {
        emailNotification = "test_sender_restricted";
        console.error(
          "Appointment was confirmed, but Resend's test sender cannot email this customer. Verify a sending domain.",
          { appointmentId: id },
        );
      } else {
        try {
          await sendAppointmentConfirmation(result.confirmation);
          emailNotification = "sent";
        } catch (error) {
          emailNotification = "failed";
          console.error(
            "Appointment was confirmed, but the customer confirmation email failed:",
            error,
          );
        }
      }
    }

    return NextResponse.json(
      { id, status, emailNotification },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Unable to update admin appointment request:", error);
    return NextResponse.json(
      { message: "Unable to update appointment request." },
      { status: 500 },
    );
  }
}
