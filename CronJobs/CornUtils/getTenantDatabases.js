import mongoose from "mongoose";
import { mongoUri } from "../../env.js";

export const getTenantDatabases = async () => {
    // Create a connection explicitly since there's no global connection
    const conn = await mongoose.createConnection(mongoUri).asPromise();

    try {
        const admin = conn.db.admin();
        const { databases } = await admin.listDatabases();

        return databases
            .map((db) => db.name)
            .filter(
                (dbName) =>
                    !["admin", "local", "config"].includes(dbName) &&
                    dbName.endsWith("_DB") // Matching the naming convention in tenantDB.js
            );
    } finally {
        // Always close the temporary connection
        await conn.close();
    }
};
