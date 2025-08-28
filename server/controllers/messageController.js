import fs from "fs"
import imagekit from "../config/imageKit.js"
import Message from "../model/Message.js"
// create an empty object to store SSE connections
const connection = {}

export const sseController = async (req, res) => {
    try {
        const { userId } = req.params
        // console.log("New Client Connected:", userId)

        // ✅ Proper SSE headers
        res.setHeader("Content-Type", "text/event-stream")
        res.setHeader("Cache-Control", "no-cache")
        res.setHeader("Connection", "keep-alive")
        res.setHeader("Access-Control-Allow-Origin", "*")

        // ✅ flush headers (some proxies require this)
        if (res.flushHeaders) res.flushHeaders()

        // ✅ Save connection
        connection[userId] = res

        // ✅ Initial handshake message
        res.write(`event: log\n`)
        res.write(`data: Connected to SSE stream for user ${userId}\n\n`)

        // ✅ Heartbeat (every 30s) to prevent timeouts
        const heartbeat = setInterval(() => {
            if (connection[userId]) {
                res.write(`event: ping\n`)
                res.write(`data: keep-alive\n\n`)
            }
        }, 30000)

        // ✅ Handle disconnect
        req.on("close", () => {
            clearInterval(heartbeat)
            delete connection[userId]
            // console.log(`Client Disconnected: ${userId}`)
        })

    } catch (error) {
        console.error("SSE Error:", error.message)
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { to_user_id, text } = req.body
        const image = req.file

        let media_url = ""
        let message_type = image ? "image" : "text"

        if (message_type === "image") {
            const buffer = fs.readFileSync(image.path)
            const response = await imagekit.upload({
                file: buffer,
                fileName: image.originalname,
            })

            media_url = imagekit.url({
                path: response.filePath,
                transformation: [
                    { quality: "auto" },
                    { format: "webp" },
                    { height: "1280" },
                ]
            })
        }

        const message = await Message.create({
            from_user_id: userId,
            to_user_id,
            text,
            message_type,
            media_url
        })

        // ✅ Populate sender details for frontend use
        const messageWithUserData = await Message.findById(message._id)
            .populate("from_user_id", "full_name profile_picture") // select only needed fields

        // ✅ Send HTTP response
        res.json({ success: true, message: messageWithUserData })

        // ✅ Push to recipient via SSE
        if (connection[to_user_id]) {
            console.log(connection[to_user_id])
            connection[to_user_id].write(`event: message\n`)
            connection[to_user_id].write(`data: ${JSON.stringify(messageWithUserData)}\n\n`)
        }

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}


export const getChatMessages = async (req, res) => {
    try {

        const { userId } = req.auth()
        const { to_user_id } = req.body;


        const messages = await Message.find({
            $or: [
                { from_user_id: userId, to_user_id: to_user_id },
                { from_user_id: to_user_id, to_user_id: userId },
            ]
        }).sort({ created_at: -1 })

        await Message.updateMany({ from_user_id: to_user_id, to_user_id: userId }, { seen: true })


        res.json({ success: true, messages })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export const getRecentMessages = async (req, res) => {
    try {

        const { userId } = req.auth()
        const messages = await Message.find({ to_user_id: userId })
            .populate("from_user_id to_user_id").sort({ created_at: -1 })

        res.json({ success: true, messages })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}