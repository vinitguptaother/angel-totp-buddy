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
    // Robust body parsing to avoid JSON parse errors
    let bodyText = '';
    try {
      bodyText = await req.text();
    } catch (e) {
      console.error('Failed reading request body as text:', e);
    }

    if (!bodyText || bodyText.trim().length === 0) {
      console.warn('Empty request body received');
      return new Response(JSON.stringify({ error: 'Empty request body', hint: 'Send JSON with action field' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contentType = req.headers.get('content-type') ?? 'unknown';
    console.log('Incoming request', { method: req.method, contentType, bodyLength: bodyText.length });

    let body: any;
    try {
      body = JSON.parse(bodyText);
    } catch (e) {
      console.error('Invalid JSON body:', { message: (e as Error).message, sample: bodyText.slice(0, 200) });
      return new Response(JSON.stringify({ error: 'Invalid JSON', hint: 'Ensure Content-Type: application/json and valid JSON' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const action = body?.action as string | undefined;

    if (!action) {
      return new Response(JSON.stringify({ error: 'Missing action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Shared headers helper
    const buildHeaders = (apiKey: string, jwtToken?: string) => ({
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Origin": "https://smartapi.angelone.in",
      "Referer": "https://smartapi.angelone.in/",
      "X-UserType": "USER",
      "X-SourceID": "WEB",
      "X-ClientLocalIP": "CLIENT_IP",
      "X-ClientPublicIP": "CLIENT_IP", 
      "X-MACAddress": "MAC_ADDRESS",
      "X-PrivateKey": apiKey,
      ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
    });

    if (action === "loginByMpin") {
      const { apiKey, clientId, mpin, totp } = body ?? {};
      
      // Sanitize and validate inputs
      const sanitizedApiKey = apiKey?.toString().trim();
      const sanitizedClientId = clientId?.toString().trim();
      const sanitizedMpin = mpin?.toString().trim();
      const sanitizedTotp = totp?.toString().trim();
      
      if (!sanitizedApiKey || !sanitizedClientId || !sanitizedMpin || !sanitizedTotp) {
        return new Response(JSON.stringify({ 
          error: "Missing required fields",
          details: "apiKey, clientId, mpin, and totp are all required"
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Validate MPIN and TOTP format
      if (!/^\d{4}$/.test(sanitizedMpin)) {
        return new Response(JSON.stringify({ 
          error: "Invalid MPIN format",
          details: "MPIN must be exactly 4 digits"
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!/^\d{6}$/.test(sanitizedTotp)) {
        return new Response(JSON.stringify({ 
          error: "Invalid TOTP format",
          details: "TOTP must be exactly 6 digits"
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log('loginByMpin attempt:', { 
        apiKeyLength: sanitizedApiKey.length, 
        clientId: sanitizedClientId, 
        mpinLength: sanitizedMpin.length,
        totpLength: sanitizedTotp.length
      });

      const url = "https://apiconnect.angelone.in/rest/auth/angelbroking/user/v1/loginByMpin";

      const resp = await fetch(url, {
        method: "POST",
        headers: buildHeaders(sanitizedApiKey),
        body: JSON.stringify({
          clientcode: sanitizedClientId,
          mpin: sanitizedMpin,
          totp: sanitizedTotp,
        }),
      });

      console.log("Angel One API response status:", resp.status);
      console.log("Angel One API response headers:", Object.fromEntries(resp.headers.entries()));

      // Safely parse Angel One API response
      const responseText = await resp.text();
      console.log("Angel One API raw response:", responseText.slice(0, 500));

      // Treat empty body as error even if status is 200
      if (!responseText || responseText.trim().length === 0) {
        return new Response(
          JSON.stringify({ 
            error: "Empty response from Angel One API",
            code: "ANGEL_EMPTY_BODY",
            status: resp.status,
            details: {
              endpoint: "loginByMpin",
              headers: Object.fromEntries(resp.headers.entries()),
            }
          }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let angelOneData: any;
      try {
        angelOneData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse Angel One API response as JSON:", parseError);
        return new Response(JSON.stringify({ 
          error: "Invalid response from Angel One API",
          code: "ANGEL_NON_JSON",
          details: "API returned non-JSON response",
          status: resp.status,
          rawResponse: responseText.slice(0, 200)
        }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Handle different response scenarios
      if (!resp.ok) {
        return new Response(JSON.stringify({ 
          error: "Angel One API error",
          details: angelOneData?.message || angelOneData?.errorMessage || "Authentication failed",
          status: resp.status,
          angelOneResponse: angelOneData
        }), {
          status: resp.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const wrapped = {
        status: true,
        message: angelOneData?.message || "OK",
        data: (angelOneData && typeof angelOneData === 'object' && 'data' in angelOneData) ? angelOneData.data : angelOneData,
      };

      return new Response(JSON.stringify(wrapped), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "getLTP") {
      const { apiKey, jwtToken, exchange, tradingsymbol, symboltoken } = body ?? {};
      
      // Sanitize inputs
      const sanitizedApiKey = apiKey?.toString().trim();
      const sanitizedJwtToken = jwtToken?.toString().trim();
      const sanitizedExchange = exchange?.toString().trim();
      const sanitizedTradingSymbol = tradingsymbol?.toString().trim();
      const sanitizedSymbolToken = symboltoken?.toString().trim();
      
      if (!sanitizedApiKey || !sanitizedJwtToken || !sanitizedExchange || !sanitizedTradingSymbol || !sanitizedSymbolToken) {
        return new Response(JSON.stringify({ 
          error: "Missing required fields",
          details: "apiKey, jwtToken, exchange, tradingsymbol, and symboltoken are all required"
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log('getLTP attempt:', { 
        exchange: sanitizedExchange, 
        tradingsymbol: sanitizedTradingSymbol, 
        symboltoken: sanitizedSymbolToken 
      });

      const url = "https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/getLTP";

      const resp = await fetch(url, {
        method: "POST",
        headers: buildHeaders(sanitizedApiKey, sanitizedJwtToken),
        body: JSON.stringify({
          exchange: sanitizedExchange,
          tradingsymbol: sanitizedTradingSymbol,
          symboltoken: sanitizedSymbolToken,
        }),
      });

      console.log("Angel One getLTP response status:", resp.status);

      // Safely parse Angel One API response
      const responseText = await resp.text();
      console.log("Angel One getLTP raw response:", responseText.slice(0, 500));

      // Treat empty body as error even if status is 200
      if (!responseText || responseText.trim().length === 0) {
        return new Response(
          JSON.stringify({ 
            error: "Empty response from Angel One API",
            code: "ANGEL_EMPTY_BODY",
            status: resp.status,
            details: {
              endpoint: "getLTP",
              headers: Object.fromEntries(resp.headers.entries()),
            }
          }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let angelOneData: any;
      try {
        angelOneData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse Angel One getLTP response as JSON:", parseError);
        return new Response(JSON.stringify({ 
          error: "Invalid response from Angel One API",
          code: "ANGEL_NON_JSON",
          details: "API returned non-JSON response",
          status: resp.status,
          rawResponse: responseText.slice(0, 200)
        }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Handle different response scenarios
      if (!resp.ok) {
        return new Response(JSON.stringify({ 
          error: "Angel One API error",
          details: angelOneData?.message || angelOneData?.errorMessage || "Failed to fetch market data",
          status: resp.status,
          angelOneResponse: angelOneData
        }), {
          status: resp.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const wrapped = {
        status: true,
        message: angelOneData?.message || "OK",
        data: (angelOneData && typeof angelOneData === 'object' && 'data' in angelOneData) ? angelOneData.data : angelOneData,
      };

      return new Response(JSON.stringify(wrapped), {
        status: 200,
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