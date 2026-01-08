import axios from "axios";

function extractPGGateways(response) {
  if (!response?.data || !Array.isArray(response.data)) return [];

  return response.data
    .filter((item) => item.type === "PG" && item.label === "PG")
    .flatMap((item) =>
      item.gateways.map((g) => ({
        gateway: g.gateway,
        gatewayCode: g.gatewayCode,
      }))
    );
}

export const getAllPaymentGatewaysService = async () => {
  const endpoint = `api/v1/maintainance/get-allgateways`;
  const response = await axios.get(`${process.env.SUPER_ADMIN_URL}/${endpoint}`);

  const result = extractPGGateways(response?.data);

  return result;
};
