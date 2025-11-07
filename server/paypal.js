import {
  Client,
  Environment,
  LogLevel,
  OAuthAuthorizationController,
  OrdersController,
} from "@paypal/paypal-server-sdk";

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE } = process.env;

const paypalConfigured = Boolean(PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET);

if (!paypalConfigured) {
  console.log('[paypal] PayPal credentials not configured - PayPal features will be disabled');
}

const envMode = (PAYPAL_MODE || (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox')).toLowerCase();

const environment = envMode === 'production' ? Environment.Production : Environment.Sandbox;

let client = null;
let ordersController = null;
let oAuthAuthorizationController = null;

if (paypalConfigured) {
  client = new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: PAYPAL_CLIENT_ID,
      oAuthClientSecret: PAYPAL_CLIENT_SECRET,
    },
    timeout: 0,
    environment,
    logging: {
      logLevel: LogLevel.Info,
      logRequest: {
        logBody: true,
      },
      logResponse: {
        logHeaders: true,
      },
    },
  });

  ordersController = new OrdersController(client);
  oAuthAuthorizationController = new OAuthAuthorizationController(client);
}

export async function getClientToken() {
  if (!paypalConfigured) {
    throw new Error('PayPal is not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables.');
  }
  
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

    const { result } = await oAuthAuthorizationController.requestToken(
      {
        authorization: `Basic ${auth}`,
      },
      { intent: "sdk_init", response_type: "client_token" },
    );

    return result?.accessToken;
  } catch (err) {
    console.error('[paypal] Failed to fetch client token.', {
      message: err?.message,
      statusCode: err?.request?.statusCode || err?.statusCode,
      body: err?.request?.body || err?.body || err?.result,
    });
    throw err;
  }
}

export async function createPaypalOrder(req, res) {
  if (!paypalConfigured) {
    return res.status(503).json({ error: "PayPal is not configured on this server." });
  }
  
  try {
    const { amount, currency, intent } = req.body;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res
        .status(400)
        .json({
          error: "Invalid amount. Amount must be a positive number.",
        });
    }

    if (!currency) {
      return res
        .status(400)
        .json({ error: "Invalid currency. Currency is required." });
    }

    if (!intent) {
      return res
        .status(400)
        .json({ error: "Invalid intent. Intent is required." });
    }

    const collect = {
      body: {
        intent: intent,
        purchaseUnits: [
          {
            amount: {
              currencyCode: currency,
              value: amount,
            },
          },
        ],
      },
      prefer: "return=minimal",
    };

    const { body, ...httpResponse } =
      await ordersController.createOrder(collect);

    const jsonResponse = JSON.parse(String(body));
    const httpStatusCode = httpResponse.statusCode;

    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
}

export async function capturePaypalOrder(req, res) {
  if (!paypalConfigured) {
    return res.status(503).json({ error: "PayPal is not configured on this server." });
  }
  
  try {
    const { orderID } = req.params;
    const collect = {
      id: orderID,
      prefer: "return=minimal",
    };

    const { body, ...httpResponse } =
      await ordersController.captureOrder(collect);

    const jsonResponse = JSON.parse(String(body));
    const httpStatusCode = httpResponse.statusCode;

    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to capture order:", error);
    res.status(500).json({ error: "Failed to capture order." });
  }
}

export async function loadPaypalDefault(req, res) {
  if (!paypalConfigured) {
    return res.status(503).json({ error: "PayPal is not configured on this server.", configured: false });
  }
  
  try {
    const clientToken = await getClientToken();
    res.json({
      clientToken,
      mode: envMode,
      configured: true
    });
  } catch (error) {
    console.error('[paypal] Error loading PayPal:', error);
    res.status(500).json({ error: "Failed to load PayPal configuration." });
  }
}
