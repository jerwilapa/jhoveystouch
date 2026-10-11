import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";
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
    const doc = await getAdminFirestore()
      .collection("appointmentRequests")
      .add({ ...result.data, status: "pending", createdAt: FieldValue.serverTimestamp() });

    return NextResponse.json({ requestId: doc.id }, { status: 201 });
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
