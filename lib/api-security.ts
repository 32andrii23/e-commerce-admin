import { z } from "zod";

const requiredText = z.string().trim().min(1).max(200);
const id = z.string().uuid();

export const billboardInputSchema = z.object({
  label: requiredText,
  imageUrl: z.string().url().max(2048),
}).strict();

export const categoryInputSchema = z.object({
  name: requiredText,
  billboardId: id,
}).strict();

export const colorInputSchema = z.object({
  name: requiredText,
  value: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Value must be a hex color"),
}).strict();

export const sizeInputSchema = z.object({
  name: requiredText,
  value: requiredText,
}).strict();

export const storeInputSchema = z.object({
  name: requiredText,
}).strict();

export const productInputSchema = z.object({
  name: requiredText,
  price: z.coerce.number().positive().finite(),
  categoryId: id,
  colorId: id,
  sizeId: id,
  images: z.array(z.object({ url: z.string().url().max(2048) }).strict()).min(1).max(8),
  isFeatured: z.boolean().default(false),
  isArchived: z.boolean().default(false),
}).strict();

export const checkoutInputSchema = z.object({
  productIds: z.array(id).min(1).max(50).refine(
    (productIds) => new Set(productIds).size === productIds.length,
    "Duplicate product ids are not allowed",
  ),
}).strict();

export function parseBody<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new InputValidationError(result.error.issues[0]?.message ?? "Invalid request body");
  }
  return result.data;
}

export class InputValidationError extends Error {}

export function configuredStorefrontOrigins(value = process.env.FRONTEND_STORE_URL): Set<string> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((origin) => origin.trim().replace(/\/$/, ""))
      .filter(Boolean),
  );
}

export function checkoutCorsHeaders(origin: string | null, configured = configuredStorefrontOrigins()): HeadersInit {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };

  if (origin && configured.has(origin.replace(/\/$/, ""))) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

export function isAllowedCheckoutOrigin(origin: string | null, configured = configuredStorefrontOrigins()): boolean {
  return origin === null || configured.has(origin.replace(/\/$/, ""));
}
