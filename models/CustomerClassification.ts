import mongoose, { Schema, Document } from "mongoose";

export interface ICustomerClassification extends Document {
    id: string;
    marketingClassification: string;
    salesClassification: string;
    description?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const CustomerClassificationSchema: Schema = new Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        marketingClassification: {
            type: String,
            required: true,
            trim: true,
        },
        salesClassification: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
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
        collection: "PHAN_LOAI_KH",
    },
);

export default mongoose.models.CustomerClassification ||
    mongoose.model<ICustomerClassification>(
        "CustomerClassification",
        CustomerClassificationSchema,
    );
