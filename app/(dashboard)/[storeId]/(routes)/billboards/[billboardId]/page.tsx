import prismadb from "@/lib/prismadb"
import { BillboardForm } from "./components/billboard-form"

const BillboardsPage = async (
    props: {
        params: Promise<{
            billboardId: string,
            storeId: string
        }>
    }
) => {
    const params = await props.params;
    const billboard = await prismadb.billboard.findFirst({
        where: {
            id: params.billboardId,
            storeId: params.storeId
        }
    })

    return (
        <div className="flex flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <BillboardForm initialData={billboard} />
            </div>
        </div>
    )
}

export default BillboardsPage;
