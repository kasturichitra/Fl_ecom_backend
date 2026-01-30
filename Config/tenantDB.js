import mongoose from "mongoose";
import { mongoUri } from "../env.js";

const connections = {};

export const getTenanteDB = async (tenateID) => {
  try {
    if (!tenateID) throw new Error("Tenate ID is required");

    if (connections[tenateID]) return connections[tenateID];

    const connt = await mongoose.createConnection(`${mongoUri}${tenateID}_DB?authSource=admin`, {
      useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    connt.on("connected", () => {
      console.log(`Connected successfully for tenant: ${tenateID}`);
    });

    connt.on("error", (err) => {
      console.error(`Connection error for tenant ${tenateID}:`, err);
    });

    connections[tenateID] = connt;
    return connt;
  } catch (error) {
    console.log("DB Connection is failed ", error);
    throw new Error("DB Connection is failed ", error.message);
  }
};

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(mongoUri, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log(`MongoDB connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error(`DB connection failed: ${error.message}`);
//     process.exit(1);
//   }
// };
// export default connectDB;
