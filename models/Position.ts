import mongoose from "mongoose";

const positionSchema = new mongoose.Schema(
    {
        positionName: { type: String, required: true },
        description: { type: String },
        department: { type: String },
        isActive: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { collection: "Chức vụ" },
);

const Position =
    mongoose.models.ChucVu || mongoose.model("ChucVu", positionSchema);
export default Position;
