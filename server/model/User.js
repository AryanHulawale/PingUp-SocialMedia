import mongoose, { mongo } from "mongoose"

const userSchema = new mongoose.Schema({
    _id: { typeof: String, required: true },
    email: { typeof: String, required: true },

    full_name: { typeof: String, required: true },
    username: { typeof: String, required: true },

    bio: { typeof: String, default: "Hey there I am using PingUp." },
    profile_picture: { typeof: String, default: "" },
    cover_photo: { typeof: String, default: "" },
    location: { typeof: String, default: "" },

    followers: [{ typeof: String, ref: "User" }],
    following: [{ typeof: String, ref: "User" }],
    connections: [{ typeof: String, ref: "User" }],

},{timestamps:true , minimize:false})


const user = mongoose.model("User",userSchema)

export default user