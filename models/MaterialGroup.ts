import mongoose, { Schema, Document } from "mongoose";

export interface IMaterialGroup extends Document {
    groupId: string;
    groupName: string;
    description?: string;
    unit?: string;
    specifications?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const MaterialGroupSchema: Schema = new Schema(
    {
        groupId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        groupName: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        unit: {
            type: String,
            trim: true,
        },
        specifications: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        collection: "Nhóm vật tư",
    },
);

export default mongoose.models.MaterialGroup ||
    mongoose.model<IMaterialGroup>("MaterialGroup", MaterialGroupSchema);
