import { describe, expect, it } from "vitest";

import {
  checkoutCorsHeaders,
  checkoutInputSchema,
  isAllowedCheckoutOrigin,
  productInputSchema,
} from "@/lib/api-security";

const firstId = "8e2ca5df-c887-4f7f-9fac-49cbd13a90f0";
const secondId = "b7fc8c84-bdad-4bee-a39d-6fccdad49eed";

describe("checkout request validation", () => {
  it("rejects malformed and duplicate product ids", () => {
    expect(checkoutInputSchema.safeParse({ productIds: ["not-an-id"] }).success).toBe(false);
    expect(checkoutInputSchema.safeParse({ productIds: [firstId, firstId] }).success).toBe(false);
  });

  it("accepts a bounded list of unique product ids", () => {
    expect(checkoutInputSchema.safeParse({ productIds: [firstId, secondId] }).success).toBe(true);
  });
});

describe("checkout CORS policy", () => {
  const origins = new Set(["https://shop.example.com"]);

  it("only reflects the configured storefront origin", () => {
    expect(isAllowedCheckoutOrigin("https://shop.example.com", origins)).toBe(true);
    expect(isAllowedCheckoutOrigin("https://evil.example.com", origins)).toBe(false);
    expect(checkoutCorsHeaders("https://evil.example.com", origins)).not.toHaveProperty(
      "Access-Control-Allow-Origin",
    );
  });

  it("advertises only POST and OPTIONS", () => {
    expect(checkoutCorsHeaders("https://shop.example.com", origins)).toMatchObject({
      "Access-Control-Allow-Origin": "https://shop.example.com",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
  });
});

describe("product request validation", () => {
  it("rejects non-positive prices and malformed relationships", () => {
    const result = productInputSchema.safeParse({
      name: "Example",
      price: 0,
      categoryId: "other-store-category",
      colorId: firstId,
      sizeId: secondId,
      images: [{ url: "https://example.com/product.jpg" }],
      isFeatured: false,
      isArchived: false,
    });

    expect(result.success).toBe(false);
  });
});
