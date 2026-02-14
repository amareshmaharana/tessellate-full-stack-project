import "dotenv/config";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import mongoose from "mongoose";

import { connectDB } from "../config/db.config.js";
import { RoleModel } from "../models/roles-permission.model.js";
import { RolePermissions } from "../utils/role-permission.js";

const seedRoles = async () => {
  console.log("Seeding roles started...");

  try {
    await connectDB();

    const session = await mongoose.startSession();
    session.startTransaction();

    console.log("Clearing existing roles...");
    await RoleModel.deleteMany({}, { session });

    for (const roleName in RolePermissions) {
      const role = roleName as keyof typeof RolePermissions;
      const permissions = RolePermissions[role];

      const existingRole = await RoleModel.findOne({ name: role }).session(
        session,
      );

      if (!existingRole) {
        const newRole = new RoleModel({
          name: role,
          permissions: permissions,
        });
        await newRole.save({ session });
        console.log(`Role ${role} seeded with permissions ${permissions}`);
      } else {
        console.log(`Role ${role} already exists`);
      }
    }

    await session.commitTransaction();
    console.log("Transaction commited successfully.");

    await session.endSession();
    console.log("Session ended successfully.");
  } catch (error) {
    console.error("Error while seeding roles :: ", error);
  }
};

seedRoles().catch((error) => {
  console.error("Error while seeding roles :: ", error);
});
