📜 Prompt Instruction: Next.js + MongoDB CRM System
1. Project Overview & Context
Goal: Build a CRM system backend using Next.js (App Router) and MongoDB.

Input Data: TRG CRM V1.csv (contains both schema definitions and seed data).

Database Philosophy: NoSQL (MongoDB).

Rule 1: 1 CSV Sheet/Group = 1 Independent Model. Do not merge small settings into one big model.

Rule 2: Avoid SQL-style "Relations" (Foreign Keys/Refs).

Strategy: Use Denormalization. When a Customer selects a Service, store a snapshot of the service details (Name, Price, ID) inside the Customer document, not just the reference ID. This optimizes read performance and historical data accuracy.

2. Technical Stack
Framework: Next.js 14+ (App Router).

Language: TypeScript.

Database: MongoDB Atlas (via Mongoose).

Environment: Use process.env.MONGODB_URI.

3. Implementation Steps for Agent
Step 1: Database Connection (src/lib/dbConnect.ts)
Create a robust MongoDB connection helper that handles Next.js hot-reloading (preventing "Too many connections" error).

Step 2: Define Mongoose Models (src/models/*.ts)
Analyze the TRG CRM V1.csv file. Identify distinct groups of data (representing the original Excel sheets) and create a model for EACH group.

Mapping Rules:

Model Names: Convert the Sheet Name/Group Name to PascalCase (English).

Cài đặt nguồn -> SourceSetting

Phân loại KH -> CustomerTier (or CustomerClass)

Loại chăm sóc -> CareType

Dịch vụ -> Service

Cài đặt gói -> ServicePackage

Danh sách hạng mục -> CategoryItem

(And any other groups found in the CSV)...

Fields: Map all columns in the CSV to Schema fields.

Number columns -> type: Number

String columns -> type: String

Boolean (Yes/No) -> type: Boolean

NoSQL Adjustment: Do not use ref: 'ModelName'. If a field links to another model, store it as a simple String (for ID) or Object (Snapshot).

Step 3: API Routes (src/app/api/...)
Create standard CRUD endpoints for ALL models created above.

GET /api/[model]: Fetch all (with query/pagination support).

POST /api/[model]: Create new.

PUT /api/[model]/[id]: Update.

DELETE /api/[model]/[id]: Delete.

Step 4: Seed Data Script (src/app/api/seed/route.ts)
CRITICAL: The user wants the system to be ready-to-use. Create a special API route that, when triggered:

Reads the hardcoded data provided in the TRG CRM V1.csv (Simulate reading the file or copy the rows into the code).

Checks if the collection is empty.

Inserts the sample data (Seed Data) for: SourceSetting, CustomerTier, CareType, Service, ServicePackage, CategoryItem.

4. Specific Model Guidance (Based on CSV Analysis)
(Agent: Please infer schema strictly from the CSV columns. Below are examples)

Model 1: SourceSetting (Cài đặt nguồn)
Schema: { name: String, code: String, active: Boolean }

Seed Data: Insert rows like "Facebook", "Google", "Referral" found in CSV.

Model 2: CustomerTier (Phân loại KH)
Schema: { name: String, minSpend: Number, discountRate: Number, ... }

Seed Data: Insert "VIP", "Potential", "Loyal" etc.

Model 3: Service (Dịch vụ)
Schema: { name: String, code: String, price: Number, description: String, ... }

Seed Data: Insert specific services with their prices from CSV.

Model 4: ServicePackage (Cài đặt gói)
Note: This likely contains a list of services.

NoSQL Handling: Instead of referencing Service IDs, store an array of service objects:

TypeScript
items: [{
    serviceName: String,
    servicePrice: Number, // Snapshot price at time of package creation
    quantity: Number
}]
5. Execution Command
"I have provided the TRG CRM V1.csv.

Setup dbConnect.ts.

Create all Mongoose Models in src/models (1 file per group found in CSV).

Generate CRUD API routes for each model.

Create a route.ts at src/app/api/seed that inserts the exact rows from the CSV into MongoDB so I have data to work with immediately." 