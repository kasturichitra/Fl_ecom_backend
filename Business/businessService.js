import { gstinVerifyUrl } from "../env.js";
import axios from "axios";
import throwIfTrue from "../utils/throwIfTrue.js";




export const gstinVerifyService = async (payload) => {
    throwIfTrue(!payload.gstinNumber, "Gstin Number Required");
    throwIfTrue(!payload.business_name, "Business Name Required");

    const { data } = await axios.post(`${gstinVerifyUrl}/business/Gstinverify`, { gstinNumber: payload.gstinNumber });
    if (data.data.companyName.toLowerCase().trim() === payload.business_name.toLowerCase().trim()) {
        return data;
    } else {
        throwIfTrue(true, "Business Name Not Matched")
    }

}