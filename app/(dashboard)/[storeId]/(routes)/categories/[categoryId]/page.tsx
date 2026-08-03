import prismadb from "@/lib/prismadb"
import { CategoryForm } from "./components/category-form"

const CategoryPage = async (
    props: {
        params: Promise<{
            categoryId: string,
            storeId: string
        }>
    }
) => {
    const params = await props.params;
    const category = await prismadb.category.findFirst({
        where: {
            id: params.categoryId,
            storeId: params.storeId
        }
    })

    const billboards = await prismadb.billboard.findMany({
        where: {
            storeId: params.storeId
        }
    })

    return (
        <div className="flex flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <CategoryForm 
                    billboards={billboards} 
                    initialData={category} 
                />
            </div>
        </div>
    )
}

export default CategoryPage;
