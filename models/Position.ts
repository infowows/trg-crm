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
    { collection: "CD_CHUCVU" },
);

const Position =
    mongoose.models.CD_CHUCVU || mongoose.model("CD_CHUCVU", positionSchema);
export default Position;
