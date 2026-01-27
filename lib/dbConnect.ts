import mongoose from "mongoose";

interface Connection {
    isConnected: boolean;
}

const connection: Connection = { isConnected: false };

async function dbConnect(): Promise<typeof mongoose> {
    if (connection.isConnected) {
        console.log("♻️ Using existing MongoDB connection");
        return mongoose;
    }

    try {
        console.log("📡 Connecting to MongoDB...");

        const db = await mongoose.connect(process.env.MONGODB_URI!, {
            bufferCommands: false,
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

export default dbConnect;
