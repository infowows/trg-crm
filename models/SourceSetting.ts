import mongoose, { Schema, Document } from "mongoose";

export interface ISourceSetting extends Document {
    name: string;
    code: string;
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const SourceSettingSchema: Schema = new Schema(
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
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        collection: "source_settings",
    },
);

export default mongoose.models.SourceSetting ||
    mongoose.model<ISourceSetting>("SourceSetting", SourceSettingSchema);
