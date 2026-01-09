const generateBusinessId = async (BusinessDb) => {
    const latestBusiness = await BusinessDb.findOne()
        .sort({ createdAt: -1 })
        .select("business_unique_id");

    if (!latestBusiness || !latestBusiness.business_unique_id) {
        return "BUS-0001";
    }

    const parts = latestBusiness.business_unique_id.split("-");
    const numericPart = parts[1];
    const nextId = parseInt(numericPart, 10) + 1;
    const paddedId = String(nextId).padStart(6, "0");

    return `BUS-${paddedId}`;
};

export default generateBusinessId;
