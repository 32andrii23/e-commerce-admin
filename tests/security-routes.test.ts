import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  storeFindFirst: vi.fn(),
  billboardUpdateMany: vi.fn(),
  productFindMany: vi.fn(),
  orderCreate: vi.fn(),
  stripeCreate: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({ auth: async () => ({ userId: "owner-user" }) }));
vi.mock("@/lib/prismadb", () => ({
  default: {
    store: { findFirst: mocks.storeFindFirst },
    billboard: { updateMany: mocks.billboardUpdateMany },
    product: { findMany: mocks.productFindMany },
    order: { create: mocks.orderCreate },
  },
}));
vi.mock("@/lib/stripe", () => ({
  stripe: { checkout: { sessions: { create: mocks.stripeCreate } } },
}));

import { PATCH as patchBillboard } from "@/app/api/[storeId]/billboards/[billboardId]/route";
import { POST as createCheckout } from "@/app/api/[storeId]/checkout/route";

const storeId = "8e2ca5df-c887-4f7f-9fac-49cbd13a90f0";
const resourceId = "b7fc8c84-bdad-4bee-a39d-6fccdad49eed";
const secondProductId = "3303a8dc-51dc-4e66-87c0-85fd21878431";

beforeEach(() => {
  process.env.FRONTEND_STORE_URL = "https://shop.example.com";
  mocks.storeFindFirst.mockResolvedValue({ id: storeId });
});

describe("tenant-scoped mutations", () => {
  it("scopes a billboard update by resource id and store id", async () => {
    mocks.billboardUpdateMany.mockResolvedValue({ count: 0 });

    const response = await patchBillboard(
      new Request("https://admin.example.com/api/path", {
        method: "PATCH",
        body: JSON.stringify({ label: "Summer", imageUrl: "https://cdn.example.com/banner.jpg" }),
      }),
      { params: Promise.resolve({ billboardId: resourceId, storeId }) },
    );

    expect(mocks.billboardUpdateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: resourceId, storeId },
    }));
    expect(response.status).toBe(404);
  });
});

describe("store-scoped checkout", () => {
  it("rejects mixed-store or inactive product ids before creating an order", async () => {
    mocks.productFindMany.mockResolvedValue([{ id: resourceId }]);

    const response = await createCheckout(
      new Request("https://admin.example.com/api/path", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "https://shop.example.com" },
        body: JSON.stringify({ productIds: [resourceId, secondProductId] }),
      }),
      { params: Promise.resolve({ storeId }) },
    );

    expect(mocks.productFindMany).toHaveBeenCalledWith({
      where: { id: { in: [resourceId, secondProductId] }, storeId, isArchived: false },
    });
    expect(response.status).toBe(400);
    expect(mocks.orderCreate).not.toHaveBeenCalled();
    expect(mocks.stripeCreate).not.toHaveBeenCalled();
  });
});
