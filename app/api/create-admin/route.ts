import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import Employee from "../../../models/Employee";

export async function POST() {
    try {
        await dbConnect();
        console.log("🔄 Creating admin user...");

        // Check if admin already exists
        const existingAdmin = await Employee.findOne({ username: "admin" });
        if (existingAdmin) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Admin user already exists",
                },
                { status: 400 },
            );
        }

        // Create admin user
        const admin = new Employee({
            username: "admin",
            password: "admin123", // Plain text as per backend logic
            fullName: "Administrator",
            email: "admin@trgcrm.com",
            role: "admin",
            active: true,
        });

        await admin.save();
        console.log("✅ Admin user created successfully");

        return NextResponse.json({
            success: true,
            message: "Admin user created successfully",
            data: {
                username: "admin",
                password: "admin123",
                fullName: "Administrator",
            },
        });
    } catch (error: any) {
        console.error("❌ Error creating admin user:", error);

        if (error.code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Admin user already exists",
                },
                { status: 400 },
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: "Failed to create admin user",
            },
            { status: 500 },
        );
    }
}
