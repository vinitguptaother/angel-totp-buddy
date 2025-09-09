import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const action = body?.action as string | undefined;

    if (!action) {
      return new Response(JSON.stringify({ error: "Missing action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Shared headers helper
    const buildHeaders = (apiKey: string, jwtToken?: string) => ({
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-UserType": "USER",
      "X-SourceID": "WEB",
      "X-ClientLocalIP": "192.168.1.1",
      "X-ClientPublicIP": "106.193.147.98",
      "X-MACAddress": "00:00:00:00:00:00",
      "X-PrivateKey": apiKey,
      ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
    });

    if (action === "loginByMpin") {
      const { apiKey, clientId, mpin, totp } = body ?? {};
      if (!apiKey || !clientId || !mpin || !totp) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const url =
        "https://apiconnect.angelone.in/rest/auth/angelbroking/user/v1/loginByMpin";

      const resp = await fetch(url, {
        method: "POST",
        headers: buildHeaders(apiKey),
        body: JSON.stringify({
          clientcode: clientId,
          mpin,
          totp,
        }),
      });

      const json = await resp.json();
      console.log("loginByMpin response status:", resp.status);

      return new Response(JSON.stringify(json), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "getLTP") {
      const { apiKey, jwtToken, exchange, tradingsymbol, symboltoken } = body ?? {};
      if (!apiKey || !jwtToken || !exchange || !tradingsymbol || !symboltoken) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const url =
        "https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/getLTP";

      const resp = await fetch(url, {
        method: "POST",
        headers: buildHeaders(apiKey, jwtToken),
        body: JSON.stringify({
          exchange,
          tradingsymbol,
          symboltoken,
        }),
      });

      const json = await resp.json();
      console.log("getLTP response status:", resp.status);

      return new Response(JSON.stringify(json), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("angel-one-proxy error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unexpected error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});