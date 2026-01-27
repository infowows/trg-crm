import mongoose, { Schema, Document } from "mongoose";

export interface IServicePricing extends Document {
    serviceGroupName: string;  // Tên nhóm dịch vụ (lưu string để xem ngay)
    serviceName: string;       // Tên dịch vụ
    packageName?: string;      // Tên gói (ví dụ: "Gói Cao Cấp")
    unitPrice: number;         // Đơn giá được thiết lập tại đây
    effectiveFrom: Date;       // Hiệu lực từ
    effectiveTo?: Date;        // Hiệu lực đến
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const ServicePricingSchema: Schema = new Schema(
    {
        serviceGroupName: {
            type: String,
            required: true,
            trim: true,
        },
        serviceName: {
            type: String,
            required: true,
            trim: true,
        },
        packageName: {
            type: String,
            default: "Mặc định", // Nếu dịch vụ không phân gói
            trim: true,
        },
        unitPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        effectiveFrom: {
            type: Date,
            required: true,
            default: Date.now,
        },
        effectiveTo: {
            type: Date,
            default: null, // Để null nếu chưa xác định ngày kết thúc
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        collection: "Cài đặt giá gói",
    },
);

// Tạo Index để hỗ trợ tìm kiếm và sắp xếp giá theo thời gian nhanh hơn
ServicePricingSchema.index({ serviceName: 1, effectiveFrom: -1 });

export default mongoose.models.ServicePricing ||
    mongoose.model<IServicePricing>("ServicePricing", ServicePricingSchema);