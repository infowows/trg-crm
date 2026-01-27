module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/dbConnect.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const connection = {
    isConnected: false
};
async function dbConnect() {
    if (connection.isConnected) {
        console.log("♻️ Using existing MongoDB connection");
        return __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"];
    }
    try {
        console.log("📡 Connecting to MongoDB...");
        const db = await __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].connect(process.env.MONGODB_URI, {
            bufferCommands: false
        });
        connection.isConnected = db.connections[0].readyState === 1;
        console.log("✅ MongoDB connected successfully");
        console.log("📊 Database name:", db.connection.name);
        return db;
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        connection.isConnected = false;
        throw error;
    }
}
const __TURBOPACK__default__export__ = dbConnect;
}),
"[project]/models/SourceSetting.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const SourceSettingSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["Schema"]({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: "source_settings"
});
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].models.SourceSetting || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].model("SourceSetting", SourceSettingSchema);
}),
"[project]/models/CustomerClassification.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const CustomerClassificationSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["Schema"]({
    id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    marketingClassification: {
        type: String,
        required: true,
        trim: true
    },
    salesClassification: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: "PHAN_LOAI_KH"
});
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].models.CustomerClassification || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].model("CustomerClassification", CustomerClassificationSchema);
}),
"[project]/models/Employee.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const EmployeeSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["Schema"]({
    employeeId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    position: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    department: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: "DSNV"
});
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].models.Employee || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].model("Employee", EmployeeSchema);
}),
"[project]/models/Customer.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const CustomerSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["Schema"]({
    customerId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    registrationDate: {
        type: Date
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    shortName: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        trim: true
    },
    source: {
        type: String,
        trim: true
    },
    referrer: {
        type: String,
        trim: true
    },
    referrerPhone: {
        type: String,
        trim: true
    },
    serviceGroup: {
        type: String,
        trim: true
    },
    marketingClassification: {
        type: String,
        trim: true
    },
    potentialLevel: {
        type: String,
        trim: true
    },
    salesPerson: {
        type: String,
        trim: true
    },
    needsNote: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: "DSKH"
});
const Customer = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].models.Customer || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].model("Customer", CustomerSchema);
const __TURBOPACK__default__export__ = Customer;
}),
"[project]/models/MaterialGroup.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const MaterialGroupSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["Schema"]({
    groupId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    groupName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    unit: {
        type: String,
        trim: true
    },
    specifications: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: "NHOM_VAT_TU"
});
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].models.MaterialGroup || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].model("MaterialGroup", MaterialGroupSchema);
}),
"[project]/models/ServicePricing.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs, [project]/node_modules/mongoose)");
;
const ServicePricingSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["Schema"]({
    serviceGroup: {
        type: String,
        required: true,
        trim: true
    },
    serviceDetail: {
        type: String,
        required: true,
        trim: true
    },
    package1: {
        type: String,
        trim: true
    },
    package2: {
        type: String,
        trim: true
    },
    package3: {
        type: String,
        trim: true
    },
    package4: {
        type: String,
        trim: true
    },
    package5: {
        type: String,
        trim: true
    },
    unitPrice: {
        type: Number,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: "CAI_DAT_GIA"
});
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].models.ServicePricing || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f$mongoose$29$__["default"].model("ServicePricing", ServicePricingSchema);
}),
"[project]/app/api/seed/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dbConnect$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/dbConnect.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$SourceSetting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/SourceSetting.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$CustomerClassification$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/CustomerClassification.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Employee$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/Employee.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Customer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/Customer.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$MaterialGroup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/MaterialGroup.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$ServicePricing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/models/ServicePricing.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
;
async function POST() {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dbConnect$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
        console.log("🔄 Starting seed data process...");
        // Seed Source Settings (Cai dat nguon)
        const sourceSettingsData = [
            {
                code: "SDF12",
                name: "Google Ads",
                active: true
            },
            {
                code: "SDF13",
                name: "Facebook",
                active: true
            },
            {
                code: "SDF14",
                name: "Sales tự tìm",
                active: true
            },
            {
                code: "SDF15",
                name: "BGĐ giao",
                active: true
            },
            {
                code: "SDF16",
                name: "CTV/ Referrals",
                active: true
            }
        ];
        const existingSourceSettings = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$SourceSetting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments();
        if (existingSourceSettings === 0) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$SourceSetting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].insertMany(sourceSettingsData);
            console.log("✅ Source settings seeded");
        }
        // Seed Customer Classifications (Phân loại KH)
        const customerClassificationsData = [
            {
                id: "SDF14",
                marketingClassification: "1. Phù Hợp",
                salesClassification: "1. Ngắn hạn",
                description: "Khách hàng phù hợp ngắn hạn"
            },
            {
                id: "SDF15",
                marketingClassification: "2. Rác",
                salesClassification: "2. Trung hạn",
                description: "Khách hàng rác, trung hạn"
            }
        ];
        const existingCustomerClassifications = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$CustomerClassification$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments();
        if (existingCustomerClassifications === 0) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$CustomerClassification$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].insertMany(customerClassificationsData);
            console.log("✅ Customer classifications seeded");
        }
        // Seed Employees (DSNV)
        const employeesData = [
            {
                employeeId: "NV001",
                fullName: "Nguyễn Văn A",
                position: "Sales Manager",
                phone: "0912345678",
                email: "anv@company.com"
            },
            {
                employeeId: "NV002",
                fullName: "Trần Thị B",
                position: "Sales Executive",
                phone: "0923456789",
                email: "btt@company.com"
            },
            {
                employeeId: "NV003",
                fullName: "Lê Văn C",
                position: "Designer",
                phone: "0934567890",
                email: "clv@company.com"
            }
        ];
        const existingEmployees = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Employee$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments();
        if (existingEmployees === 0) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Employee$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].insertMany(employeesData);
            console.log("✅ Employees seeded");
        }
        // Seed Customers (DSKH)
        const customersData = [
            {
                customerId: "KH-0001",
                fullName: "Công ty ABC",
                shortName: "ABC",
                address: "123 Nguyễn Huệ, Q.1, TP.HCM",
                phone: "0281234567",
                source: "Google Ads",
                marketingClassification: "1. Phù Hợp",
                potentialLevel: "Cao",
                salesPerson: "Nguyễn Văn A"
            },
            {
                customerId: "KH-0002",
                fullName: "Công ty XYZ",
                shortName: "XYZ",
                address: "456 Lê Lợi, Q.1, TP.HCM",
                phone: "0282345678",
                source: "Facebook",
                marketingClassification: "2. Rác",
                potentialLevel: "Trung bình",
                salesPerson: "Trần Thị B"
            }
        ];
        const existingCustomers = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Customer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments();
        if (existingCustomers === 0) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Customer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].insertMany(customersData);
            console.log("✅ Customers seeded");
        }
        // Seed Service Pricing (Cai dat gia)
        const servicePricingData = [
            {
                serviceGroup: "Thiết kế xây dựng",
                serviceDetail: "Thiết kế nhà cấp 4",
                package1: "Gói cơ bản",
                unitPrice: 500000
            },
            {
                serviceGroup: "Thiết kế xây dựng",
                serviceDetail: "Thiết kế nhà cấp 4 gác lửng",
                package1: "Gói tiêu chuẩn",
                unitPrice: 800000
            },
            {
                serviceGroup: "Thiết kế xây dựng",
                serviceDetail: "Thiết kế nhà phố",
                package2: "Gói cao cấp",
                unitPrice: 1200000
            }
        ];
        const existingServicePricing = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$ServicePricing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments();
        if (existingServicePricing === 0) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$ServicePricing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].insertMany(servicePricingData);
            console.log("✅ Service pricing seeded");
        }
        // Seed Material Groups (Nhom vat tu)
        const materialGroupsData = [
            {
                groupId: "VT001",
                groupName: "Vật liệu xây dựng",
                description: "Gạch, xi măng, cát, đá"
            },
            {
                groupId: "VT002",
                groupName: "Vật liệu hoàn thiện",
                description: "Sơn, sàn, cửa"
            },
            {
                groupId: "VT003",
                groupName: "Thiết bị điện nước",
                description: "Điện, nước, điều hòa"
            }
        ];
        const existingMaterialGroups = await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$MaterialGroup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments();
        if (existingMaterialGroups === 0) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$MaterialGroup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].insertMany(materialGroupsData);
            console.log("✅ Material groups seeded");
        }
        console.log("🎉 Seed data completed successfully!");
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: "Seed data completed successfully",
            data: {
                sourceSettings: sourceSettingsData.length,
                customerClassifications: customerClassificationsData.length,
                employees: employeesData.length,
                customers: customersData.length,
                servicePricing: servicePricingData.length,
                materialGroups: materialGroupsData.length
            }
        });
    } catch (error) {
        console.error("❌ Error seeding data:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Failed to seed data"
        }, {
            status: 500
        });
    }
}
async function GET() {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$dbConnect$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
        const [sourceSettings, customerClassifications, employees, customers, servicePricing, materialGroups] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$SourceSetting$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments(),
            __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$CustomerClassification$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments(),
            __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Employee$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments(),
            __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$Customer$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments(),
            __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$ServicePricing$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments(),
            __TURBOPACK__imported__module__$5b$project$5d2f$models$2f$MaterialGroup$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].countDocuments()
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: {
                sourceSettings,
                customerClassifications,
                employees,
                customers,
                servicePricing,
                materialGroups
            }
        });
    } catch (error) {
        console.error("❌ Error checking seed data:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Failed to check seed data"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__11e97e96._.js.map