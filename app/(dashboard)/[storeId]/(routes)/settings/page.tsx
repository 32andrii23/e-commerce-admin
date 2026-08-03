import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";
import { SettingsForm } from "./components/settings-form";

interface SettingsPageProps {
    params: Promise<{
        storeId: string
    }>
}

const SettingsPage = async (props: SettingsPageProps) => {
    const params = await props.params;
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const store = await prismadb.store.findFirst({
        where: {
            userId,
            id: params.storeId
        }
    })

    if(!store) redirect("/");

    return (
        <div className="flex flex-col">
            <div className="flex-1 space-x-4 p-8 pt-6">
                <SettingsForm initialData={store} />
            </div>
        </div>
    )
}

export default SettingsPage;
