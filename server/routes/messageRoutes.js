import express from "express"
import { getChatMessages, sendMessage, sseController } from "../controllers/messageController.js"
import { protect } from "../middlewares/auth.js"
import { upload } from "../config/multer.js"

const messageRoutes = express.Router()

messageRoutes.get("/:userId", sseController)
messageRoutes.post("/send", upload.single("image"), protect, sendMessage)
messageRoutes.post("/get", protect, getChatMessages)

export default messageRoutes