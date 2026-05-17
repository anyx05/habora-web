import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@3.2.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  try {
    // Basic verification: Check if it's a POST request
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Parse the webhook payload from Supabase Database Webhook
    const payload = await req.json();

    // Only process INSERT events on bookings
    if (payload.type === 'INSERT' && payload.table === 'bookings') {
      const record = payload.record;
      
      const email = record.customer_email;
      const name = record.customer_name;
      const vessel = record.vessel_name;
      const arrival = record.arrival_date;
      const departure = record.departure_date;
      
      if (!email || !name) {
         console.error("Missing email or name in payload:", record);
         return new Response(
           JSON.stringify({ error: "Missing required fields" }),
           { headers: { "Content-Type": "application/json" }, status: 400 }
         );
      }

      console.log(`Sending confirmation email to ${email} for vessel ${vessel}`);

      const { data, error } = await resend.emails.send({
        from: 'Habora <onboarding@resend.dev>', // Replace with verified domain in production
        to: [email],
        subject: `Booking Confirmed: ${vessel} at Habora`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
            <h1 style="color: #06b6d4;">Booking Confirmation</h1>
            <p>Ahoy <strong>${name}</strong>!</p>
            <p>Your berth reservation for <strong>${vessel}</strong> has been successfully confirmed.</p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #06b6d4; padding: 16px; margin: 24px 0;">
              <h3 style="margin-top: 0; color: #0f172a;">Reservation Details</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 8px;"><strong>Arrival:</strong> ${arrival}</li>
                <li style="margin-bottom: 8px;"><strong>Departure:</strong> ${departure}</li>
                <li><strong>Status:</strong> Confirmed</li>
              </ul>
            </div>
            
            <p>We look forward to welcoming you to the marina.</p>
            <p style="color: #64748b; font-size: 14px; margin-top: 48px;">Safe travels,<br>The Habora Team</p>
          </div>
        `,
      });

      if (error) {
        console.error("Resend API Error:", error);
        return new Response(JSON.stringify({ error }), {
          headers: { "Content-Type": "application/json" },
          status: 400,
        });
      }

      console.log("Email sent successfully:", data);
      
      return new Response(JSON.stringify({ success: true, id: data?.id }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Ignore other events
    return new Response(JSON.stringify({ message: "Ignored event type." }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
