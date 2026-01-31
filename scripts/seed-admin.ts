import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import Employee from "../models/Employee";
import dbConnect from "../lib/dbConnect";

// Load environment variables
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const seedAdminCountAccount = async () => {
  try {
    await dbConnect();

    console.log("Model Collection Name:", Employee.collection.name);

    const adminData = {
      employeeId: "EMP-ADMIN-01",
      fullName: "Lê Trương Trọng Tấn",
      position: "Dev",
      phone: "0916467039",
      email: "tannguyen0916@gmail.com",
      address: "149/10 lý thanh tông",
      department: "R&B",
      isActive: true, // boolean
      username: "admin",
      password: "admin123",
      role: "admin",
      gender: "Nam", // Assuming gender
      dob: new Date("1995-01-01"), // Assuming DOB
    };

    const existingUser = await Employee.findOne({
      $or: [
        { username: adminData.username },
        { email: adminData.email },
        { employeeId: adminData.employeeId },
      ],
    });

    if (existingUser) {
      console.log("⚠️ Admin account already exists:");
      console.log({
        id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
      });
      console.log("Updating existing account...");
      Object.assign(existingUser, adminData);
      await existingUser.save();
      console.log("✅ Admin account updated successfully!");
    } else {
      const newAdmin = new Employee(adminData);
      await newAdmin.save();
      console.log("✅ Admin account created successfully!");
      console.log({
        username: newAdmin.username,
        password: newAdmin.password,
      });
    }
  } catch (error) {
    console.error("❌ Error seeding admin account:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
  }
};

seedAdminCountAccount();
