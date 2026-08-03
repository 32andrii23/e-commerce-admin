import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { categoryInputSchema, InputValidationError, parseBody } from "@/lib/api-security";
import { categoryRelationsBelongToStore } from "@/lib/store-relations";

export async function POST(req: Request, props: { params: Promise<{ storeId: string }> }) {
    const params = await props.params;
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

        const { name, billboardId } = parseBody(categoryInputSchema, await req.json());
        
        if (!params.storeId) return new NextResponse("Store Id is required", { status: 400 });

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

        const category = await prismadb.category.create({
            data: {
                name,
                billboardId,
                storeId: params.storeId
            }
        })
        
        return NextResponse.json(category);
    } catch (error) {
        if (error instanceof InputValidationError || error instanceof SyntaxError) return new NextResponse(error.message, { status: 400 });
        console.log("[CATEGORIES_POST]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(req: Request, props: { params: Promise<{ storeId: string }> }) {
    const params = await props.params;
    try {
        if (!params.storeId) return new NextResponse("Store Id is required", { status: 400 });

        const categories = await prismadb.category.findMany({
            where: {
                storeId: params.storeId
            }
        })
        
        return NextResponse.json(categories);
    } catch (error) {
        console.log("[CATEGORIES_GET]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}
