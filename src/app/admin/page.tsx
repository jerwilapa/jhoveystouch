"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Status = "pending" | "confirmed" | "cancelled";
type Appointment = {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  time: string;
  language: "en" | "ar";
  status: Status;
  createdAt: number | null;
};

type ApiError = { message?: string };

async function getErrorMessage(response: Response, fallback: string): Promise<string> {
  const body: ApiError = await response.json().catch(() => ({}));
  return body.message || fallback;
}

function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value || "Date not provided";
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).toLocaleDateString(
    undefined,
    { year: "numeric", month: "short", day: "numeric" },
  );
}

function getWhatsAppUrl(phone: string): string | null {
  const normalized = phone.replace(/[^\d+]/g, "");
  const international = normalized.startsWith("+")
    ? normalized.slice(1)
    : normalized.startsWith("00")
      ? normalized.slice(2)
      : null;
  return international && international.length >= 8 && international.length <= 15
    ? `https://wa.me/${international}`
    : null;
}

function getConfirmationWhatsAppUrl(appointment: Appointment): string | null {
  const contactUrl = getWhatsAppUrl(appointment.phone);
  if (!contactUrl) return null;

  const date = formatDate(appointment.date);
  const message =
    appointment.language === "ar"
      ? `مرحبًا ${appointment.name}، تم تأكيد موعدكِ في جهوفي تاتش.\n\nالخدمة: ${appointment.service}\nالتاريخ: ${date}\nالوقت: ${appointment.time}\n\nنتطلع إلى زيارتكِ!`
      : `Hello ${appointment.name}, your appointment at Jhovey's Touch is confirmed.\n\nService: ${appointment.service}\nDate: ${date}\nTime: ${appointment.time}\n\nWe look forward to seeing you!`;

  return `${contactUrl}?text=${encodeURIComponent(message)}`;
}

export default function AdminPage() {
  const [authState, setAuthState] = useState<"checking" | "signedOut" | "signedIn">("checking");
  const [password, setPassword] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/appointments", { cache: "no-store" });
      if (response.status === 401) {
        setAuthState("signedOut");
        setAppointments([]);
        return;
      }
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Could not load requests."));
      }
      const result: {
        appointments: Appointment[];
        hasMore: boolean;
        nextCursor: string | null;
      } = await response.json();
      setAppointments(result.appointments);
      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
      setAuthState("signedIn");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function loadOlderAppointments() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/appointments?cursor=${encodeURIComponent(nextCursor)}`,
        { cache: "no-store" },
      );
      if (response.status === 401) {
        setAuthState("signedOut");
        setAppointments([]);
        return;
      }
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Could not load older requests."));
      }
      const result: {
        appointments: Appointment[];
        hasMore: boolean;
        nextCursor: string | null;
      } = await response.json();
      setAppointments((current) => [...current, ...result.appointments]);
      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load older requests.");
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/session", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(await getErrorMessage(response, "Admin sign-in is not configured."));
        }
        return response.json() as Promise<{ authenticated: boolean }>;
      })
      .then((session) => {
        if (!active) return;
        if (session.authenticated) {
          void loadAppointments();
        } else {
          setAuthState("signedOut");
        }
      })
      .catch((sessionError: unknown) => {
        if (active) {
          setError(sessionError instanceof Error ? sessionError.message : "Could not check sign-in.");
          setAuthState("signedOut");
        }
      });
    return () => {
      active = false;
    };
  }, [loadAppointments]);

  const visibleAppointments = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return appointments.filter((appointment) => {
      const matchesFilter = filter === "all" || appointment.status === filter;
      const matchesSearch =
        !query ||
        [appointment.name, appointment.phone, appointment.email, appointment.service, appointment.date]
          .join(" ")
          .toLocaleLowerCase()
          .includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [appointments, filter, search]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Could not sign in."));
      }
      setPassword("");
      setAuthState("signedIn");
      await loadAppointments();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Could not sign in.");
      setLoading(false);
    }
  }

  async function handleLogout() {
    setError("");
    try {
      const response = await fetch("/api/admin/session", { method: "DELETE" });
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Could not sign out."));
      }
      setAppointments([]);
      setAuthState("signedOut");
      setNotice("");
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : "Could not sign out.");
    }
  }

  async function updateStatus(
    id: string,
    status: Status,
    resendConfirmation = false,
  ) {
    setBusyId(id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/appointments/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, resendConfirmation }),
      });
      if (response.status === 401) {
        setAuthState("signedOut");
        setAppointments([]);
        return;
      }
      if (!response.ok) {
        throw new Error(await getErrorMessage(response, "Could not update this request."));
      }
      const result: { emailNotification?: string } = await response.json();
      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === id ? { ...appointment, status } : appointment,
        ),
      );
      if (status === "confirmed") {
        const emailNotice = {
          sent: resendConfirmation
            ? "Confirmation email resent to the customer."
            : "Confirmation email sent to the customer.",
          missing_email: "Request confirmed, but this customer has no valid email address.",
          test_sender_restricted:
            "Request confirmed, but Resend's test sender cannot email customers. Verify a sending domain in Resend, then resend the confirmation.",
          failed:
            "Request confirmed, but the confirmation email failed. Check the server logs and Resend dashboard, then resend.",
          not_applicable: "Request status updated.",
        }[result.emailNotification ?? "failed"];
        setNotice(emailNotice ?? "Request confirmed, but email delivery could not be verified.");
      } else {
        setNotice("Request status updated.");
      }
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update this request.");
    } finally {
      setBusyId("");
    }
  }

  const counts = {
    all: appointments.length,
    pending: appointments.filter((appointment) => appointment.status === "pending").length,
    confirmed: appointments.filter((appointment) => appointment.status === "confirmed").length,
    cancelled: appointments.filter((appointment) => appointment.status === "cancelled").length,
  };

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <a className="admin-brand" href="/" aria-label="Jhovey's Touch home">
          <Image src="/jhoveystouchlogo.png" alt="" width={58} height={58} priority />
          <span><strong>Jhovey&apos;s Touch</strong><small>APPOINTMENT ADMIN</small></span>
        </a>
        {authState === "signedIn" && (
          <div className="admin-header-actions">
            <a className="admin-home-link" href="/">View website</a>
            <button className="admin-quiet-button" type="button" onClick={handleLogout}>Sign out</button>
          </div>
        )}
      </header>

      {authState === "checking" ? (
        <section className="admin-login-card"><p className="admin-muted">Checking secure session…</p></section>
      ) : authState === "signedOut" ? (
        <section className="admin-login-card">
          <p className="admin-eyebrow">PRIVATE DASHBOARD</p>
          <h1>Welcome back</h1>
          <p className="admin-muted">Sign in to review and manage appointment requests.</p>
          <form className="admin-login-form" onSubmit={handleLogin}>
            <label htmlFor="admin-password">Admin password</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              maxLength={1024}
            />
            {error && <p className="admin-error" role="alert">{error}</p>}
            <button className="admin-primary-button" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </section>
      ) : (
        <section className="admin-content">
          <div className="admin-title-row">
            <div>
              <p className="admin-eyebrow">SALON OVERVIEW</p>
              <h1>Appointment requests</h1>
              <p className="admin-muted">Review requests and update their status after contacting the customer.</p>
            </div>
            <button className="admin-quiet-button" type="button" onClick={() => void loadAppointments()} disabled={loading}>
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          <div className="admin-stats" aria-label="Request totals">
            <div><span>Loaded requests</span><strong>{counts.all}</strong></div>
            <div><span>Awaiting response</span><strong>{counts.pending}</strong></div>
            <div><span>Confirmed</span><strong>{counts.confirmed}</strong></div>
            <div><span>Cancelled</span><strong>{counts.cancelled}</strong></div>
          </div>

          {error && <p className="admin-error admin-feedback" role="alert">{error}</p>}
          {notice && <p className="admin-success admin-feedback" role="status">{notice}</p>}

          <div className="admin-toolbar">
            <label className="admin-search">
              <span className="sr-only">Search requests</span>
              <input
                type="search"
                placeholder="Search name, phone, service or date"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <label className="admin-filter">
              <span className="sr-only">Filter by status</span>
              <select value={filter} onChange={(event) => setFilter(event.target.value as "all" | Status)}>
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
          </div>

          <p className="admin-limit-note">
            Search and status totals include loaded requests. {hasMore ? "Load older requests to continue through your history." : "All requests are loaded."}
          </p>

          {loading && appointments.length === 0 ? (
            <div className="admin-empty">Loading appointment requests…</div>
          ) : visibleAppointments.length === 0 ? (
            <div className="admin-empty">
              {appointments.length === 0 ? "No appointment requests yet." : "No requests match your search."}
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Customer</th><th>Service</th><th>Requested time</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {visibleAppointments.map((appointment) => {
                    const whatsappUrl = getWhatsAppUrl(appointment.phone);
                    const confirmationWhatsAppUrl =
                      appointment.status === "confirmed"
                        ? getConfirmationWhatsAppUrl(appointment)
                        : null;
                    return (
                      <tr key={appointment.id}>
                        <td>
                          <strong>{appointment.name || "Customer"}</strong>
                          <a className="admin-customer-phone" href={`tel:${appointment.phone.replace(/[^\d+]/g, "")}`}>
                            {appointment.phone || "No phone provided"}
                          </a>
                          {appointment.email && <a className="admin-customer-email" href={`mailto:${appointment.email}`}>{appointment.email}</a>}
                          {whatsappUrl && <a className="admin-whatsapp-link" href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>}
                        </td>
                        <td>{appointment.service || "Service not provided"}</td>
                        <td><strong>{formatDate(appointment.date)}</strong><span className="admin-time">{appointment.time}</span></td>
                        <td><span className={`admin-status admin-status-${appointment.status}`}>{appointment.status}</span></td>
                        <td>
                          <div className="admin-row-actions">
                            {appointment.status !== "confirmed" && (
                              <button type="button" className="admin-action-confirm" onClick={() => void updateStatus(appointment.id, "confirmed")} disabled={busyId === appointment.id}>
                                {busyId === appointment.id ? "Saving…" : "Confirm"}
                              </button>
                            )}
                            {appointment.status === "confirmed" && appointment.email && (
                              <button type="button" className="admin-action-confirm" onClick={() => void updateStatus(appointment.id, "confirmed", true)} disabled={busyId === appointment.id}>
                                {busyId === appointment.id ? "Sending…" : "Resend email"}
                              </button>
                            )}
                            {confirmationWhatsAppUrl && (
                              <a
                                className="admin-action-whatsapp"
                                href={confirmationWhatsAppUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Send WhatsApp confirmation
                              </a>
                            )}
                            {appointment.status !== "cancelled" && (
                              <button type="button" className="admin-action-cancel" onClick={() => void updateStatus(appointment.id, "cancelled")} disabled={busyId === appointment.id}>
                                Cancel
                              </button>
                            )}
                            {appointment.status !== "pending" && (
                              <button type="button" className="admin-action-reopen" onClick={() => void updateStatus(appointment.id, "pending")} disabled={busyId === appointment.id}>
                                Reopen
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {hasMore && (
            <div className="admin-load-more">
              <button
                className="admin-quiet-button"
                type="button"
                onClick={() => void loadOlderAppointments()}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading older requests…" : "Load older requests"}
              </button>
            </div>
          )}
          <p className="admin-footnote">Requests are not confirmed bookings until you contact the customer and confirm availability.</p>
        </section>
      )}
    </main>
  );
}
