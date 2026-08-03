import prismadb from "@/lib/prismadb"
import { ColorForm } from "./components/color-form"

const ColorPage = async (
    props: {
        params: Promise<{
            colorId: string,
            storeId: string
        }>
    }
) => {
    const params = await props.params;
    const color = await prismadb.color.findFirst({
        where: {
            id: params.colorId,
            storeId: params.storeId
        }
    })

    return (
        <div className="flex flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ColorForm initialData={color} />
            </div>
        </div>
    )
}

export default ColorPage;
