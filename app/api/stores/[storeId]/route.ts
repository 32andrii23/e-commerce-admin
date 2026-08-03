import prismadb from "@/lib/prismadb";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { InputValidationError, parseBody, storeInputSchema } from "@/lib/api-security";

export async function PATCH(req: Request, props: { params: Promise<{ storeId: string }> }) {
    const params = await props.params;
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { name } = parseBody(storeInputSchema, await req.json());

        if(!params.storeId) return new NextResponse("Store id is required", { status: 400 });

        const store = await prismadb.store.updateMany({
            where: {
                id: params.storeId,
                userId
            },
            data: {
                name: name
            }
        });
        if (store.count === 0) return new NextResponse("Store not found", { status: 404 });
        
        return NextResponse.json(store);
    } catch (error) {
        if (error instanceof InputValidationError || error instanceof SyntaxError) return new NextResponse(error.message, { status: 400 });
        console.log("[STORE_PATCH]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ storeId: string }> }) {
    const params = await props.params;
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
        
        if(!params.storeId) return new NextResponse("Store id is required", { status: 400 });
        
        const store = await prismadb.store.deleteMany({
            where: {
                id: params.storeId,
                userId
            }
        });
        if (store.count === 0) return new NextResponse("Store not found", { status: 404 });
        
        return NextResponse.json(store);
    } catch (error) {
        console.log("[STORE_DELETE]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}
