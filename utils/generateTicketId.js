export const generateTicketNumber = async (DB) => {
    const year = new Date().getFullYear();

    // Count how many tickets exist this year
    const count = await DB.countDocuments({
        ticket_number: { $regex: `^TCK-${year}` },
    });

    // Example: TCK-2025-0001
    const ticket_number = `TCK-${year}-${String(count + 1).padStart(7, "0")}`;

    return ticket_number;
};