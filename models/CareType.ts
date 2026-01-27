import mongoose, { Schema, Document } from "mongoose";

export interface ICareType extends Document {
    name: string;
    code: string;
    description?: string;
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const CareTypeSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        collection: "care_types",
    },
);

export default mongoose.models.CareType ||
    mongoose.model<ICareType>("CareType", CareTypeSchema);
