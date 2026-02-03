import mongoose from "mongoose";

// Schema cho gói khảo sát
const surveySchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // tên nhóm-hạng mục = name CategoryGroup + name CategoryItem hoặc chỉ là CategoryGroup vì không có CategoryItem
        unit: { type: String, enum: ["m2", "m3"], required: true }, // đơn vị tính
        length: { type: Number, default: 0 }, // dài
        width: { type: Number, default: 0 }, // rộng
        area: { type: Number, default: 0 }, // diện tích
        coefficient: { type: Number, default: 1 }, // hệ số (2 số thập phân)
        volume: { type: Number, default: 0 }, // khối lượng = dài*rộng*hệ số
        note: { type: String }, // ghi chú
    },
    { _id: false },
); // Tắt _id cho subdocuments

const projectSurveySchema = new mongoose.Schema(
    {
        surveyNo: { type: String, unique: true, required: true }, // số khảo sát
        surveys: [surveySchema], // mảng các danh mục
        quotationNo: { type: String, default: null }, // số báo giá khi được tạo báo giá
        status: {
            type: String,
            enum: ["draft", "surveyed", "quoted", "completed"],
            default: "draft",
        },
        surveyDate: { type: Date, required: true }, // ngày khảo sát
        surveyAddress: { type: String }, // địa chỉ khảo sát
        surveyNotes: { type: String }, // ghi chú khảo sát
        createdBy: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { collection: "Khảo sát dự án" },
);

// Pre-save middleware để tính toán các giá trị
projectSurveySchema.pre("save", async function () {
    try {
        // Truy cập surveys một cách an toàn
        const surveys = this.get ? this.get("surveys") : this.surveys;

        if (!surveys || !Array.isArray(surveys)) {
            this.updatedAt = new Date();
            return;
        }

        if (surveys.length === 0) {
            this.updatedAt = new Date();
            return;
        }

        // Tính toán khối lượng cho tất cả các hạng mục khảo sát
        surveys.forEach((survey: any) => {
            // Đảm bảo các giá trị là số
            const length = parseFloat(survey.length) || 0;
            const width = parseFloat(survey.width) || 0;
            const coefficient = parseFloat(survey.coefficient) || 1;

            // Tính diện tích = dài * rộng
            survey.area = length * width;

            // Tính khối lượng = dài * rộng * hệ số
            survey.volume = length * width * coefficient;
        });

        // Cập nhật lại surveys với giá trị đã tính
        if (this.set) {
            this.set("surveys", surveys);
        }

        this.updatedAt = new Date();
    } catch (error) {
        console.error("Error in pre-save middleware:", error);
    }
});

const ProjectSurvey =
    mongoose.models.PROJECT_SURVEY ||
    mongoose.model("PROJECT_SURVEY", projectSurveySchema);
export default ProjectSurvey;
