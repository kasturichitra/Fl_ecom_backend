import { v4 as uuid } from "uuid";

const generateBusinessId = () => {
  const uniqueId = `BUS_${Date.now()}_${uuid().slice(-4)}`;
  return uniqueId;
};

export default generateBusinessId;
