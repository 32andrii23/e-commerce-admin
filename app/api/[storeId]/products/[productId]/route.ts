import prismadb from "@/lib/prismadb";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { InputValidationError, parseBody, productInputSchema } from "@/lib/api-security";
import { productRelationsBelongToStore } from "@/lib/store-relations";

export async function GET(
    req: Request,
    props: { params: Promise<{ productId: string, storeId: string }> }
) {
    const params = await props.params;
    try {
        if (!params.productId) return new NextResponse("Product id is required", { status: 400 });

        const product = await prismadb.product.findFirst({
            where: {
                id: params.productId,
                storeId: params.storeId,
                isArchived: false
            },
            include: {
                images: true,
                category: true,
                color: true,
                size: true
            }
        });
        if (!product) return new NextResponse("Product not found", { status: 404 });

        return NextResponse.json(product);
    } catch (error) {
        console.log("[PRODUCT_GET]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    props: { params: Promise<{ productId: string, storeId: string }> }
) {
    const params = await props.params;
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

        const {
            name,
            price,
            categoryId,
            colorId,
            sizeId,
            images,
            isFeatured,
            isArchived
        } = parseBody(productInputSchema, await req.json());
        if (!params.storeId) return new NextResponse("Store Id is required", { status: 400 });

        if (!params.productId) return new NextResponse("Product id is required", { status: 400 });

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        })
        if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

        if (!(await productRelationsBelongToStore(params.storeId, { categoryId, colorId, sizeId }))) {
            return new NextResponse("Product relationships must belong to this store", { status: 400 });
        }

        const ownedProduct = await prismadb.product.findFirst({
            where: {
                id: params.productId,
                storeId: params.storeId,
            },
            select: { id: true },
        });
        if (!ownedProduct) return new NextResponse("Product not found", { status: 404 });

        const product = await prismadb.$transaction(async (transaction) => {
            await transaction.product.update({
                where: { id: ownedProduct.id },
                data: {
                    name,
                    price,
                    categoryId,
                    colorId,
                    sizeId,
                    images: { deleteMany: {} },
                    isFeatured,
                    isArchived,
                },
            });

            return transaction.product.update({
                where: { id: ownedProduct.id },
                data: {
                    images: {
                        createMany: { data: images },
                    },
                },
            });
        });

        return NextResponse.json(product);
    } catch (error) {
        if (error instanceof InputValidationError || error instanceof SyntaxError) return new NextResponse(error.message, { status: 400 });
        console.log("[PRODUCT_PATCH]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ storeId: string, productId: string }> }
) {
    const params = await props.params;
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

        if (!params.productId) return new NextResponse("Product id is required", { status: 400 });

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        })
        if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

        const product = await prismadb.product.deleteMany({
            where: {
                id: params.productId,
                storeId: params.storeId
            }
        });
        if (product.count === 0) return new NextResponse("Product not found", { status: 404 });

        return NextResponse.json(product);
    } catch (error) {
        console.log("[PRODUCT_DELETE]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}
