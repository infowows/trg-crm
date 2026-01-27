import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
    customerId: string;
    registrationDate?: Date;
    fullName: string;
    shortName?: string;
    address?: string;
    phone?: string;
    image?: string;
    source?: string;
    referrer?: string;
    referrerPhone?: string;
    serviceGroup?: string;
    marketingClassification?: string;
    potentialLevel?: string;
    salesPerson?: string;
    needsNote?: string;
    isActive: boolean;
    latitude?: number;
    longitude?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const CustomerSchema: Schema = new Schema(
    {
        customerId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        registrationDate: {
            type: Date,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        shortName: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        image: {
            type: String,
            trim: true,
        },
        source: {
            type: String,
            trim: true,
        },
        referrer: {
            type: String,
            trim: true,
        },
        referrerPhone: {
            type: String,
            trim: true,
        },
        serviceGroup: {
            type: String,
            trim: true,
        },
        marketingClassification: {
            type: String,
            trim: true,
        },
        potentialLevel: {
            type: String,
            trim: true,
        },
        salesPerson: {
            type: String,
            trim: true,
        },
        needsNote: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        latitude: {
            type: Number,
        },
        longitude: {
            type: Number,
        },
    },
    {
        timestamps: true,
        collection: "DSKH",
    },
);

const Customer =
    mongoose.models.Customer ||
    mongoose.model<ICustomer>("Customer", CustomerSchema);
export default Customer;
