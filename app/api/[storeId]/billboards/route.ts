import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { billboardInputSchema, InputValidationError, parseBody } from "@/lib/api-security";

export async function POST(req: Request, props: { params: Promise<{ storeId: string }> }) {
    const params = await props.params;
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

        const { label, imageUrl } = parseBody(billboardInputSchema, await req.json());
        
        if (!params.storeId) return new NextResponse("Store Id is required", { status: 400 });

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        })
        if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

        const billboard = await prismadb.billboard.create({
            data: {
                label,
                imageUrl,
                storeId: params.storeId
            }
        })
        
        return NextResponse.json(billboard);
    } catch (error) {
        if (error instanceof InputValidationError || error instanceof SyntaxError) return new NextResponse(error.message, { status: 400 });
        console.log("[BILLBOARDS_POST]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(req: Request, props: { params: Promise<{ storeId: string }> }) {
    const params = await props.params;
    try {
        if (!params.storeId) return new NextResponse("Store Id is required", { status: 400 });

        const billboards = await prismadb.billboard.findMany({
            where: {
                storeId: params.storeId
            }
        })
        
        return NextResponse.json(billboards);
    } catch (error) {
        console.log("[BILLBOARDS_GET]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}
