const GetOrdersDashBoard = async (tenantId, filters = {}) => {
    throwIfTrue(!tenantId, "Tenant ID is required");
    let {
        searchTerm,
        user_id,
        from,
        to,
        payment_status,
        order_type,
        cash_on_delivery,
        payment_method,
        order_status,
        page = 1,
        limit = 10,
        sort,
    } = filters;

    
}