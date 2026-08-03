import prismadb from "@/lib/prismadb";

export async function categoryRelationsBelongToStore(storeId: string, billboardId: string): Promise<boolean> {
  const billboard = await prismadb.billboard.findFirst({
    where: { id: billboardId, storeId },
    select: { id: true },
  });
  return Boolean(billboard);
}

export async function productRelationsBelongToStore(
  storeId: string,
  relationIds: { categoryId: string; colorId: string; sizeId: string },
): Promise<boolean> {
  const [category, color, size] = await Promise.all([
    prismadb.category.findFirst({ where: { id: relationIds.categoryId, storeId }, select: { id: true } }),
    prismadb.color.findFirst({ where: { id: relationIds.colorId, storeId }, select: { id: true } }),
    prismadb.size.findFirst({ where: { id: relationIds.sizeId, storeId }, select: { id: true } }),
  ]);

  return Boolean(category && color && size);
}
