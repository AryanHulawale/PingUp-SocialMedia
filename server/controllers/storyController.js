import fs from "fs"
import imagekit from "../config/imageKit.js";
import Story from "../model/Story.js";
import User from "../model/User.js";
import { inngest } from "../innjest/index.js";

// addStory
export const addUserStory = async (req, res) => {
    try {
        const { userId } = req.auth();

        const { content, media_type, background_color } = req.body

        const media = req.file
        let media_url = ""

        if (media_type === "image" || media_type === "video") {
            const fileBuffer = fs.readFileSync(media.path)
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: media.originalname
            })
            media_url = response.url
        }

        const story = await Story.create({
            user: userId,
            content,
            media_url,
            media_type,
            background_color
        })

        await inngest.send({
            name : "app/story.delete",
            data : {storyId : story._id}
        })

        res.json({ success: true , message: "Story created successfully" })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
// getStory
export const getStories = async (req, res) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId)

        const userIds = [user, ...user.connections, ...user.following]

        const stories = await Story.find({ user: { $in: userIds } }).populate("user").sort({ created_at: -1 })

        res.json({ success: true, stories })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}