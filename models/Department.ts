import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        description: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        manager: {
            type: String,
            trim: true,
        },
        employeeCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        collection: "Phòng ban",
    },
);

// Index for search
departmentSchema.index({ name: 1 });
departmentSchema.index({ isActive: 1 });

export default mongoose.models.Department ||
    mongoose.model("Department", departmentSchema);
