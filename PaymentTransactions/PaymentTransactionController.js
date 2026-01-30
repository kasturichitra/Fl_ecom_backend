import { errorResponse, successResponse } from "../utils/responseHandler.js";
import { getAllPaymentTransactionsService } from "./PaymentTransactionService.js";





export const getAllPaymentTransactions = async (req, res) => {
    try {
        const filters = req.query
        const tenantId = req.headers["x-tenant-id"];
        const response = await getAllPaymentTransactionsService(tenantId,filters);
        res.status(200).json(successResponse("Payment Transactions fetched successfully", { data: response }));
    } catch (error) {
        res.status(500).json(errorResponse(error.message, error));
    }
};


// export const getPaymentTransactionByIdController = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const tenantId = req.headers["x-tenant-id"];

//         if (!id) {
//             return res.status(400).json(errorResponse("Payment Transaction unique ID is required in URL"));
//         }

//         const response = await getPaymentTransactionByIdService(tenantId,id);
//         res.status(200).json(successResponse("Payment Transaction fetched successfully", { data: response }));
//     } catch (error) {
//         res.status(500).json(errorResponse(error.message, error));
//     }
// };