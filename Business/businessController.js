import { errorResponse, successResponse } from "../utils/responseHandler.js";
import { gstinVerifyService } from "./businessService.js";





export const gstinVerifyController = async (req, res) => {
    try {
        const response = await gstinVerifyService(req.body);
        res.status(200).json(successResponse("Gstin Verify Success", response));
    } catch (error) {
        res.status(500).json(errorResponse(error.message, error));
    }
};