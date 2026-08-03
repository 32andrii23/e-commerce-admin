import prismadb from "@/lib/prismadb";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { billboardInputSchema, InputValidationError, parseBody } from "@/lib/api-security";

export async function GET(
    req: Request,
    props: { params: Promise<{ billboardId: string, storeId: string }> }
) {
    const params = await props.params;
    try {
        if(!params.billboardId) return new NextResponse("Billboard id is required", { status: 400 });
        
        const billboard = await prismadb.billboard.findFirst({
            where: {
                id: params.billboardId,
                storeId: params.storeId
            }
        });
        if(!billboard) return new NextResponse("Billboard not found", { status: 404 });
        
        return NextResponse.json(billboard);
    } catch (error) {
        console.log("[BILLBOARD_GET]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    props: { params: Promise<{ billboardId: string, storeId: string }> }
) {
    const params = await props.params;
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

        const { label, imageUrl } = parseBody(billboardInputSchema, await req.json());

        if(!params.billboardId) return new NextResponse("Billboard id is required", { status: 400 });

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        })
        if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

        const billboard = await prismadb.billboard.updateMany({
            where: {
                id: params.billboardId,
                storeId: params.storeId
            },
            data: {
                label,
                imageUrl
            }
        });
        if (billboard.count === 0) return new NextResponse("Billboard not found", { status: 404 });
        
        return NextResponse.json(billboard);
    } catch (error) {
        if (error instanceof InputValidationError || error instanceof SyntaxError) return new NextResponse(error.message, { status: 400 });
        console.log("[BILLBOARD_PATCH]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ storeId: string, billboardId: string }> }
) {
    const params = await props.params;
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthenticated", { status: 401 });
        
        if(!params.billboardId) return new NextResponse("Billboard id is required", { status: 400 });
        
        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        })
        if (!storeByUserId) return new NextResponse("Unauthorized", { status: 403 });

        const billboard = await prismadb.billboard.deleteMany({
            where: {
                id: params.billboardId,
                storeId: params.storeId
            }
        });
        if (billboard.count === 0) return new NextResponse("Billboard not found", { status: 404 });
        
        return NextResponse.json(billboard);
    } catch (error) {
        console.log("[BILLBOARD_DELETE]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}
