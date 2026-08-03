import prismadb from "@/lib/prismadb";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { colorInputSchema, InputValidationError, parseBody } from "@/lib/api-security";

export async function GET(
    req: Request,
    props: { params: Promise<{ colorId: string, storeId: string }> }
) {
    const params = await props.params;
    try {
        if(!params.colorId) return new NextResponse("Color id is required", { status: 400 });
        
        const color = await prismadb.color.findFirst({
            where: {
                id: params.colorId,
                storeId: params.storeId
            }
        });
        if(!color) return new NextResponse("Color not found", { status: 404 });
        
        return NextResponse.json(color);
    } catch (error) {
        console.log("[COLOR_GET]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    props: { params: Promise<{ colorId: string, storeId: string }> }
) {
    const params = await props.params;
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

        const { name, value } = parseBody(colorInputSchema, await req.json());

        if(!params.colorId) return new NextResponse("Color id is required", { status: 400 });

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        })
        if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

        const color = await prismadb.color.updateMany({
            where: {
                id: params.colorId,
                storeId: params.storeId
            },
            data: {
                name,
                value
            }
        });
        if (color.count === 0) return new NextResponse("Color not found", { status: 404 });
        
        return NextResponse.json(color);
    } catch (error) {
        if (error instanceof InputValidationError || error instanceof SyntaxError) return new NextResponse(error.message, { status: 400 });
        console.log("[COLOR_PATCH]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ storeId: string, colorId: string }> }
) {
    const params = await props.params;
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
        
        if(!params.colorId) return new NextResponse("Color id is required", { status: 400 });
        
        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        })
        if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

        const color = await prismadb.color.deleteMany({
            where: {
                id: params.colorId,
                storeId: params.storeId
            }
        });
        if (color.count === 0) return new NextResponse("Color not found", { status: 404 });
        
        return NextResponse.json(color);
    } catch (error) {
        console.log("[COLOR_DELETE]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}
