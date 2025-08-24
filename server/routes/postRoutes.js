import express from "express"
import { protect } from "../middlewares/auth.js"
import { addPosts, getFeedPosts, likePost } from "../controllers/postController.js"
import { upload } from "../config/multer.js"

const postRouter = express.Router()

postRouter.post("/add", protect , upload.array("images",4) ,addPosts)
postRouter.post("/like", protect , likePost)
postRouter.get("/feed", protect , getFeedPosts)


export default postRouter
