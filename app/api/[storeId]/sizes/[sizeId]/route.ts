import prismadb from "@/lib/prismadb";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { InputValidationError, parseBody, sizeInputSchema } from "@/lib/api-security";

export async function GET(
    req: Request,
    props: { params: Promise<{ sizeId: string, storeId: string }> }
) {
    const params = await props.params;
    try {
        if(!params.sizeId) return new NextResponse("Size id is required", { status: 400 });
        
        const size = await prismadb.size.findFirst({
            where: {
                id: params.sizeId,
                storeId: params.storeId
            }
        });
        if(!size) return new NextResponse("Size not found", { status: 404 });
        
        return NextResponse.json(size);
    } catch (error) {
        console.log("[SIZE_GET]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    props: { params: Promise<{ sizeId: string, storeId: string }> }
) {
    const params = await props.params;
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

        const { name, value } = parseBody(sizeInputSchema, await req.json());

        if(!params.sizeId) return new NextResponse("Size id is required", { status: 400 });

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        })
        if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

        const size = await prismadb.size.updateMany({
            where: {
                id: params.sizeId,
                storeId: params.storeId
            },
            data: {
                name,
                value
            }
        });
        if (size.count === 0) return new NextResponse("Size not found", { status: 404 });
        
        return NextResponse.json(size);
    } catch (error) {
        if (error instanceof InputValidationError || error instanceof SyntaxError) return new NextResponse(error.message, { status: 400 });
        console.log("[SIZE_PATCH]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ storeId: string, sizeId: string }> }
) {
    const params = await props.params;
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
        
        if(!params.sizeId) return new NextResponse("Size id is required", { status: 400 });
        
        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        })
        if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

        const size = await prismadb.size.deleteMany({
            where: {
                id: params.sizeId,
                storeId: params.storeId
            }
        });
        if (size.count === 0) return new NextResponse("Size not found", { status: 404 });
        
        return NextResponse.json(size);
    } catch (error) {
        console.log("[SIZE_DELETE]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}
