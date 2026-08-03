import prismadb from "@/lib/prismadb";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { categoryInputSchema, InputValidationError, parseBody } from "@/lib/api-security";
import { categoryRelationsBelongToStore } from "@/lib/store-relations";

export async function GET(
    req: Request,
    props: { params: Promise<{ categoryId: string, storeId: string }> }
) {
    const params = await props.params;
    try {
        if(!params.categoryId) return new NextResponse("Category id is required", { status: 400 });
        
        const category = await prismadb.category.findFirst({
            where: {
                id: params.categoryId,
                storeId: params.storeId
            },
            include: {
                billboard: true
            }
        });
        if(!category) return new NextResponse("Category not found", { status: 404 });
        
        return NextResponse.json(category);
    } catch (error) {
        console.log("[CATEGORY_GET]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    props: { params: Promise<{ categoryId: string, storeId: string }> }
) {
    const params = await props.params;
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

        const { name, billboardId } = parseBody(categoryInputSchema, await req.json());

        if(!params.categoryId) return new NextResponse("Category id is required", { status: 400 });

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        })
        if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

        if (!(await categoryRelationsBelongToStore(params.storeId, billboardId))) {
            return new NextResponse("Billboard does not belong to this store", { status: 400 });
        }

        const category = await prismadb.category.updateMany({
            where: {
                id: params.categoryId,
                storeId: params.storeId
            },
            data: {
                name,
                billboardId
            }
        });
        if (category.count === 0) return new NextResponse("Category not found", { status: 404 });
        
        return NextResponse.json(category);
    } catch (error) {
        if (error instanceof InputValidationError || error instanceof SyntaxError) return new NextResponse(error.message, { status: 400 });
        console.log("[CATEGORY_PATCH]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ storeId: string, categoryId: string }> }
) {
    const params = await props.params;
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
        
        if(!params.categoryId) return new NextResponse("Category id is required", { status: 400 });
        
        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        })
        if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

        const category = await prismadb.category.deleteMany({
            where: {
                id: params.categoryId,
                storeId: params.storeId
            }
        });
        if (category.count === 0) return new NextResponse("Category not found", { status: 404 });
        
        return NextResponse.json(category);
    } catch (error) {
        console.log("[CATEGORY_DELETE]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}
