import mongoose from "mongoose";

const connectDb = async()=>{
    try{
        mongoose.connection.on("connected",()=>{
            console.log("MongoDB Database Connected")
        })
        await mongoose.connect(`${process.env.MONGODB_URL}/pingup`)
    }catch(e){
        console.log(e)
    }
}

export default connectDb