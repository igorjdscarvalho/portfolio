const EVENT_TYPE_VERSION = "2026-06-12";
const BOOKING_VERSION = "2026-02-25";

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    }
  });
}

function publicBookingFields(fields) {
  return (Array.isArray(fields) ? fields : []).filter((f) => !f.hidden && !f.isHidden).map((f) => ({
    field: f.field,
    slug: f.slug,
    name: f.name,
    type: f.type,
    variant: f.variant,
    label: f.label,
    placeholder: f.placeholder,
    required: f.required === true || f.required === "true",
    options: f.options,
    hidden: false
  }));
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = env.ALLOWED_ORIGIN;
    if (!allowedOrigin || origin !== allowedOrigin) return new Response("Forbidden", { status: 403 });
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin"
      }});
    }
    if (!env.CAL_API_KEY) return json({ error: "Cal.com API secret is not configured." }, 503, allowedOrigin);

    const url = new URL(request.url);
    const eventTypeId = String(env.CAL_EVENT_TYPE_ID || "7806199");
    const apiHeaders = {
      "Authorization": "Bearer " + env.CAL_API_KEY,
      "cal-api-version": EVENT_TYPE_VERSION
    };

    if (url.pathname === "/event-type" && request.method === "GET") {
      const response = await fetch("https://api.cal.com/v2/event-types/" + encodeURIComponent(eventTypeId), { headers: apiHeaders });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) return json({ error: "Could not read Cal.com event configuration." }, response.status, allowedOrigin);
      const event = payload.data || {};
      return json({ data: {
        bookingFields: publicBookingFields(event.bookingFields),
        allowGuests: event.disableGuests !== true,
        lengthInMinutes: event.lengthInMinutes
      }}, 200, allowedOrigin);
    }

    if (url.pathname === "/bookings" && request.method === "POST") {
      let input;
      try { input = await request.json(); } catch (_) { return json({ error: "Invalid JSON body." }, 400, allowedOrigin); }
      if (String(input.eventTypeId) !== eventTypeId || !input.start || !Number.isFinite(Date.parse(input.start))) {
        return json({ error: "Invalid event type or start time." }, 400, allowedOrigin);
      }
      const attendee = input.attendee || {};
      if (!attendee.name || (!attendee.email && !attendee.phoneNumber)) return json({ error: "Attendee name and contact are required." }, 400, allowedOrigin);
      const guests = Array.isArray(input.guests) ? Array.from(new Set(input.guests.map((x) => String(x).trim()).filter(Boolean))) : [];
      if (guests.length > 30 || guests.some((email) => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))) {
        return json({ error: "Check the additional participant email addresses." }, 400, allowedOrigin);
      }
      const body = {
        eventTypeId: Number(eventTypeId) || eventTypeId,
        start: new Date(input.start).toISOString(),
        attendee: {
          name: String(attendee.name).trim(),
          timeZone: String(attendee.timeZone || "America/Sao_Paulo"),
          email: attendee.email ? String(attendee.email).trim() : undefined,
          phoneNumber: attendee.phoneNumber ? String(attendee.phoneNumber).trim() : undefined
        },
        bookingFieldsResponses: input.bookingFieldsResponses && typeof input.bookingFieldsResponses === "object" ? input.bookingFieldsResponses : {},
        guests
      };
      const response = await fetch("https://api.cal.com/v2/bookings", {
        method: "POST",
        headers: { ...apiHeaders, "cal-api-version": BOOKING_VERSION, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = await response.json().catch(() => ({ error: "Invalid response from Cal.com." }));
      return json(payload, response.status, allowedOrigin);
    }

    return json({ error: "Not found." }, 404, allowedOrigin);
  }
};
