import QRCode from "qrcode";

export const generateQRCodeBase64 = async (text) => {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 300,
  });
};
