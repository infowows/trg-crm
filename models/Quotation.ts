import mongoose from "mongoose";

const quotationSchema = new mongoose.Schema(
    {
        quotationNo: { type: String, unique: true },
        customer: { type: String },
        date: { type: Date },
        validTo: { type: Date },
        items: [
            {
                product: { type: String },
                quantity: { type: Number },
                unit: { type: String },
                unitPrice: { type: Number },
                total: { type: Number },
            },
        ],
        totalAmount: { type: Number },
        taxAmount: { type: Number },
        grandTotal: { type: Number },
        status: { type: String, default: "draft" },
        createdBy: { type: String },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { collection: "BAOGIA" },
);

const Quotation =
    mongoose.models.BAOGIA || mongoose.model("BAOGIA", quotationSchema);
export default Quotation;
