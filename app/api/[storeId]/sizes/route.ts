import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { InputValidationError, parseBody, sizeInputSchema } from "@/lib/api-security";

export async function POST(req: Request, props: { params: Promise<{ storeId: string }> }) {
    const params = await props.params;
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

        const { name, value } = parseBody(sizeInputSchema, await req.json());
        
        if (!params.storeId) return new NextResponse("Store Id is required", { status: 400 });

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        })
        if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

        const size = await prismadb.size.create({
            data: {
                name,
                value,
                storeId: params.storeId
            }
        })
        
        return NextResponse.json(size);
    } catch (error) {
        if (error instanceof InputValidationError || error instanceof SyntaxError) return new NextResponse(error.message, { status: 400 });
        console.log("[SIZES_POST]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(req: Request, props: { params: Promise<{ storeId: string }> }) {
    const params = await props.params;
    try {
        if (!params.storeId) return new NextResponse("Store Id is required", { status: 400 });

        const sizes = await prismadb.size.findMany({
            where: {
                storeId: params.storeId
            }
        })
        
        return NextResponse.json(sizes);
    } catch (error) {
        console.log("[SIZES_GET]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}
