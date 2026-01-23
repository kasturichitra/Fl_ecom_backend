import mongoose from "mongoose";
import { getTenanteDB } from "../Config/tenantDB.js";

const ecomFeatureSchema = new mongoose.Schema(
  {
    featureId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

const EcomFeatureModel = async (tenantId) => {
  const db = await getTenanteDB(tenantId);
  return db.models.EcomFeature || db.model("EcomFeature", ecomFeatureSchema);
};

export default EcomFeatureModel;
