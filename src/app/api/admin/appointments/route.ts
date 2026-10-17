import { NextRequest, NextResponse } from "next/server";
import { hasValidAdminSession } from "@/lib/admin-auth";
import { getAdminFirestore } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const REQUEST_LIMIT = 50;
const STATUSES = ["pending", "confirmed", "cancelled"] as const;
type AppointmentStatus = (typeof STATUSES)[number];

function isAppointmentStatus(value: unknown): value is AppointmentStatus {
  return typeof value === "string" && STATUSES.includes(value as AppointmentStatus);
}

export async function GET(request: NextRequest) {
  try {
    if (!hasValidAdminSession(request)) {
      return NextResponse.json({ message: "Please sign in to view requests." }, { status: 401 });
    }

    const collection = getAdminFirestore().collection("appointmentRequests");
    let query = collection.orderBy("createdAt", "desc");
    const cursor = new URL(request.url).searchParams.get("cursor");
    if (cursor) {
      if (!/^[A-Za-z0-9_-]{1,150}$/.test(cursor)) {
        return NextResponse.json({ message: "Invalid request page cursor." }, { status: 400 });
      }
      const cursorDocument = await collection.doc(cursor).get();
      if (!cursorDocument.exists) {
        return NextResponse.json({ message: "Request page not found." }, { status: 400 });
      }
      query = query.startAfter(cursorDocument);
    }
    const snapshot = await query.limit(REQUEST_LIMIT + 1).get();
    const hasMore = snapshot.docs.length > REQUEST_LIMIT;
    const pageDocuments = snapshot.docs.slice(0, REQUEST_LIMIT);

    const appointments = pageDocuments.map((document) => {
      const data = document.data();
      return {
        id: document.id,
        name: typeof data.name === "string" ? data.name : "",
        phone: typeof data.phone === "string" ? data.phone : "",
        email: typeof data.email === "string" ? data.email : "",
        service:
          typeof data.service === "string"
            ? data.service
            : Array.isArray(data.services)
              ? data.services.filter((service: unknown) => typeof service === "string").join(", ")
              : "",
        date: typeof data.date === "string" ? data.date : "",
        time: typeof data.time === "string" ? data.time : "",
        language: data.language === "ar" ? "ar" : "en",
        status: isAppointmentStatus(data.status) ? data.status : "pending",
        createdAt:
          typeof data.createdAt?.toMillis === "function"
            ? data.createdAt.toMillis()
            : null,
      };
    });

    return NextResponse.json(
      {
        appointments,
        hasMore,
        nextCursor: hasMore ? pageDocuments[pageDocuments.length - 1]?.id ?? null : null,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Unable to load admin appointment requests:", error);
    return NextResponse.json(
      { message: "Unable to load appointment requests." },
      { status: 500 },
    );
  }
}
