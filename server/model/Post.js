import mongoose from "mongoose"

const postSchema = new mongoose.Schema({

    user: { type: String, ref: "User", required: true },
    content: { type: String },
    image_urls: [{ type: String }],
    post_type: { type: String, enum: ["image", "text", "text_with_image"], required: true },
    like_counts: [{ type: String, ref: "User" }],

}, { timestamps: true, minimize: false })

const Post = mongoose.model("Post", postSchema)

export default Post