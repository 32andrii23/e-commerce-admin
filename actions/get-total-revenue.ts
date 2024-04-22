import prismadb from "@/lib/prismadb";

export const getTotalRevenue = async (storeId: string) => {
    const paidOrders = await prismadb
        .order
        .findMany({
            where: {
                storeId,
                isPaid: true
            },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            }
        })

    const totalRevenue = paidOrders.reduce((total: number, order) => {
        return total + order.orderItems.reduce((total, item) => {
            return total + Number(item.product.price);
        }, 0);
    }, 0);

    return totalRevenue;
}