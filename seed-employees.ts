import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Employee from "./models/Employee";
import Department from "./models/Department";
import Position from "./models/Position";
import * as dotenv from "dotenv";
import path from "path";

// Load env
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define MONGODB_URI in .env.local");
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log("Connected to MongoDB");

    // 1. Create Departments if not exists
    const deptNames = ["Marketing", "Ban Giám đốc"];
    for (const name of deptNames) {
      await Department.findOneAndUpdate(
        { name },
        { name, isActive: true },
        { upsert: true },
      );
    }
    console.log("Departments seeded");

    // 2. Create Positions if not exists
    const positions = [
      { positionName: "Marketing Lead", department: "Marketing" },
      { positionName: "Marketing Staff", department: "Marketing" },
      { positionName: "Giám đốc", department: "Ban Giám đốc" },
    ];
    for (const pos of positions) {
      await Position.findOneAndUpdate(
        { positionName: pos.positionName },
        { ...pos, isActive: true },
        { upsert: true },
      );
    }
    console.log("Positions seeded");

    // 3. Create Employees
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash("123456", salt);

    const employees = [
      {
        employeeId: "NV001",
        fullName: "Nguyễn Văn Admin",
        username: "admin",
        password: hashedPassword,
        role: "admin",
        department: "Ban Giám đốc",
        position: "Giám đốc",
        email: "admin@company.com",
        isActive: true,
      },
      {
        employeeId: "NV002",
        fullName: "Trần Thị Lead",
        username: "lead_mkt",
        password: hashedPassword,
        role: "user",
        department: "Marketing",
        position: "Marketing Lead",
        email: "lead.mkt@company.com",
        isActive: true,
      },
      {
        employeeId: "NV003",
        fullName: "Lê Văn Staff 1",
        username: "staff1_mkt",
        password: hashedPassword,
        role: "user",
        department: "Marketing",
        position: "Marketing Staff",
        email: "staff1.mkt@company.com",
        isActive: true,
      },
      {
        employeeId: "NV004",
        fullName: "Phạm Thị Staff 2",
        username: "staff2_mkt",
        password: hashedPassword,
        role: "user",
        department: "Marketing",
        position: "Marketing Staff",
        email: "staff2.mkt@company.com",
        isActive: true,
      },
    ];

    for (const emp of employees) {
      await Employee.findOneAndUpdate({ username: emp.username }, emp, {
        upsert: true,
        new: true,
      });
    }

    console.log("Employees seeded successfully!");
    console.log("-----------------------------------");
    console.log("Accounts created (Password: 123456):");
    employees.forEach((e) =>
      console.log(
        `- ${e.fullName} (${e.username}) - Role: ${e.role} - Pos: ${e.position}`,
      ),
    );

    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seed();
