import mongoose, { Schema, Document } from "mongoose";

export interface ICustomerCare extends Document {
    careId: string;
    customerId?: string;
    employeeId?: string;
    careType: string;
    timeFrom?: Date;
    timeTo?: Date;
    method: "Online" | "Trực tiếp";
    location?: string;
    carePerson: string;
    actualCareDate?: Date;
    images?: string[];
    files?: string[];
    interestedServices?: string;
    discussionContent?: string;
    needsNote?: string;
    status: "Hoàn thành" | "Chờ báo cáo" | "Hủy";
    createdAt?: Date;
    updatedAt?: Date;
}

const CustomerCareSchema: Schema = new Schema(
    {
        careId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        customerId: {
            type: String,
            trim: true,
        },
        employeeId: {
            type: String,
            trim: true,
        },
        careType: {
            type: String,
            required: true,
            trim: true,
        },
        timeFrom: {
            type: Date,
        },
        timeTo: {
            type: Date,
        },
        method: {
            type: String,
            enum: ["Online", "Trực tiếp"],
            default: "Online",
        },
        location: {
            type: String,
            trim: true,
        },
        carePerson: {
            type: String,
            required: true,
            trim: true,
        },
        actualCareDate: {
            type: Date,
        },
        images: [
            {
                type: String,
                trim: true,
            },
        ],
        files: [
            {
                type: String,
                trim: true,
            },
        ],
        interestedServices: {
            type: String,
            trim: true,
        },
        discussionContent: {
            type: String,
            trim: true,
        },
        needsNote: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["Hoàn thành", "Chờ báo cáo", "Hủy"],
            default: "Chờ báo cáo",
        },
    },
    {
        timestamps: true,
        collection: "CSKH",
    },
);

export default mongoose.models.CustomerCare ||
    mongoose.model<ICustomerCare>("CustomerCare", CustomerCareSchema);
