import mongoose, { Schema, Document } from "mongoose";

export interface ICategoryItem extends Document {
    name: string;
    code: string;
    notes?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const CategoryItemSchema: Schema = new Schema(
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
        note:{
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
        collection: "Hạng mục",
    },
);

export default mongoose.models.CategoryItem ||
    mongoose.model<ICategoryItem>("CategoryItem", CategoryItemSchema);
