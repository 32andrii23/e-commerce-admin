import Stripe from "stripe";
import { NextResponse } from "next/server";

import {
  checkoutCorsHeaders,
  checkoutInputSchema,
  configuredStorefrontOrigins,
  InputValidationError,
  isAllowedCheckoutOrigin,
  parseBody,
} from "@/lib/api-security";
import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";

function checkoutResponse(body: string | Record<string, unknown> | null, status: number, origin: string | null) {
  const headers = checkoutCorsHeaders(origin);
  if (typeof body === "string" || body === null) {
    return new NextResponse(body, { status, headers });
  }
  return NextResponse.json(body, { status, headers });
}

function storefrontUrl(): string {
  const configuredUrl = Array.from(configuredStorefrontOrigins())[0];
  if (!configuredUrl) throw new Error("FRONTEND_STORE_URL is not configured");
  return configuredUrl;
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");
  if (!isAllowedCheckoutOrigin(origin)) return checkoutResponse("Origin is not allowed", 403, origin);
  return checkoutResponse(null, 204, origin);
}

export async function POST(req: Request, props: { params: Promise<{ storeId: string }> }) {
  const params = await props.params;
  const origin = req.headers.get("origin");
  if (!isAllowedCheckoutOrigin(origin)) return checkoutResponse("Origin is not allowed", 403, origin);

  try {
    if (!params.storeId) return checkoutResponse("Store Id is required", 400, origin);
    const { productIds } = parseBody(checkoutInputSchema, await req.json());
    const returnBaseUrl = storefrontUrl();

    const products = await prismadb.product.findMany({
      where: {
        id: { in: productIds },
        storeId: params.storeId,
        isArchived: false,
      },
    });

    if (products.length !== productIds.length) {
      return checkoutResponse("One or more products are unavailable for this store", 400, origin);
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = products.map((product) => ({
      quantity: 1,
      price_data: {
        currency: "USD",
        product_data: { name: product.name },
        unit_amount: Math.round(Number(product.price) * 100),
      },
    }));

    const order = await prismadb.order.create({
      data: {
        storeId: params.storeId,
        isPaid: false,
        orderItems: {
          create: productIds.map((productId) => ({ product: { connect: { id: productId } } })),
        },
      },
    });

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      success_url: `${returnBaseUrl}/cart?success=1`,
      cancel_url: `${returnBaseUrl}/cart?canceled=1`,
      metadata: { orderId: order.id },
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return checkoutResponse({ url: session.url }, 200, origin);
  } catch (error) {
    if (error instanceof InputValidationError || error instanceof SyntaxError) {
      return checkoutResponse(error.message || "Invalid request body", 400, origin);
    }
    console.error("[CHECKOUT_POST]", error);
    return checkoutResponse("Unable to create checkout session", 500, origin);
  }
}
