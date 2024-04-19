import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function POST(
    req: Request
) {
    try {
        const { userId } = auth();
        if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

        const body = await req.json();
        const { name } = body;
        if (!name) return new NextResponse("Name is required", { status: 400 });

        const store = await prismadb.store.create({
            data: {
                name: name,
                userId: userId
            }
        })
        
        return NextResponse.json(store);
    } catch (error) {
        console.log("[STORES_POST]", error)
        return new NextResponse("Internal error", { status: 500 });
    }
}