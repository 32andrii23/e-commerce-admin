import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { InputValidationError, parseBody, productInputSchema } from "@/lib/api-security";
import { productRelationsBelongToStore } from "@/lib/store-relations";

export async function POST(req: Request, props: { params: Promise<{ storeId: string }> }) {
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

        const product = await prismadb.product.create({
            data: {
                name,
                price,
                categoryId,
                colorId,
                sizeId,
                images: {
                    createMany: {
                        data: images
                    }
                },
                isFeatured,
                isArchived,
                storeId: params.storeId
            }
        })
        
        return NextResponse.json(product);
    } catch (error) {
        if (error instanceof InputValidationError || error instanceof SyntaxError) return new NextResponse(error.message, { status: 400 });
        console.log("[PRODUCTS_POST]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(req: Request, props: { params: Promise<{ storeId: string }> }) {
    const params = await props.params;
    try {
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get("categoryId") || undefined;
        const colorId = searchParams.get("colorId") || undefined;
        const sizeId = searchParams.get("sizeId") || undefined;
        const isFeatured = searchParams.get("isFeatured");
        
        if (!params.storeId) return new NextResponse("Store Id is required", { status: 400 });

        const products = await prismadb.product.findMany({
            where: {
                storeId: params.storeId,
                categoryId,
                colorId,
                sizeId,
                isFeatured: isFeatured ? true : undefined,
                isArchived: false
            },
            include: {
                category: true,
                color: true,
                size: true,
                images: true
            },
            orderBy: {
                createdAt: "desc"
            }
        })
        
        return NextResponse.json(products);
    } catch (error) {
        console.log("[PRODUCTS_GET]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}
