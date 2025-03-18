import mongoose from "mongoose";


let cached = global.mongoose;

if(!cached){
    cached = global.mongoose = {conn: null, promise: null};
}

async function connectDB(){
    if(cached.conn){
        return cached.conn;
    }

    if(!cached.promise){
        const options = {
            bufferCommands: false,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }

        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }

        cached.promise = mongoose.connect(process.env.MONGO_URI, options).then((mongoose) => {
            console.log("MongoDB Connected Successfully!");
            return mongoose;
        }).catch(err => {
            console.error("MongoDB Connection Error:", err);
            process.exit(1); // Dừng server nếu không kết nối được DB
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

export default connectDB;