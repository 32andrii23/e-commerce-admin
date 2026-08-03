import prismadb from "@/lib/prismadb"
import { SizeForm } from "./components/size-form"

const SizePage = async (
    props: {
        params: Promise<{
            sizeId: string,
            storeId: string
        }>
    }
) => {
    const params = await props.params;
    const size = await prismadb.size.findFirst({
        where: {
            id: params.sizeId,
            storeId: params.storeId
        }
    })

    return (
        <div className="flex flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <SizeForm initialData={size} />
            </div>
        </div>
    )
}

export default SizePage;
