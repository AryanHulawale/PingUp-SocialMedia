import express from "express"
import {
    acceptUserConnection, discoverUsers, followUsers,
    getUserConnections, getUserData, getUserProfile, sendConnectionRequests,
    unFollowUsers, updateUserData
} from "../controllers/userController.js";
import { protect } from "../middlewares/auth.js";
import { upload } from "../config/multer.js";
import { getRecentMessages } from "../controllers/messageController.js";

const userRouter = express.Router();

userRouter.get("/data", protect, getUserData)
userRouter.post("/update", upload.fields([{ name: "profile", maxCount: 1 },
{ name: "cover", maxCount: 1 }]),
    protect, updateUserData)
userRouter.post("/discover", protect, discoverUsers)
userRouter.post("/follow", protect, followUsers)
userRouter.post("/unfollow", protect, unFollowUsers)

userRouter.post("/connect", protect, sendConnectionRequests)
userRouter.post("/accept", protect, acceptUserConnection)
userRouter.get("/connections", protect, getUserConnections) 

userRouter.post("/profile",getUserProfile)

userRouter.get("/recent-messages",protect , getRecentMessages)

export default userRouter