import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { InputValidationError, parseBody, storeInputSchema } from "@/lib/api-security";

export async function POST(
    req: Request
) {
    try {
        const { userId } = await auth();
        if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

        const { name } = parseBody(storeInputSchema, await req.json());

        const store = await prismadb.store.create({
            data: {
                name: name,
                userId: userId
            }
        })
        
        return NextResponse.json(store);
    } catch (error) {
        if (error instanceof InputValidationError || error instanceof SyntaxError) return new NextResponse(error.message, { status: 400 });
        console.log("[STORES_POST]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}
