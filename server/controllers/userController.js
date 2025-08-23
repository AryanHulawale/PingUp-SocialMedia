import imagekit from "../config/imageKit.js";
import Connection from "../model/Connection.js";
import User from "../model/User.js";
import fs from "fs"


export const getUserData = async (req, res) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId)
        if (!userId) {
            return res.json({ success: false, message: "User Not Found" })
        }
        res.json({ success: true, user })
    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: error.message })
    }
}

export const updateUserData = async (req, res) => {
    try {
        const { userId } = req.auth();
        let { username, bio, location, full_name } = req.body

        const tempUser = await User.findById(userId)


        if (!username) {
            username = tempUser.username;
        }

        if (tempUser.username !== username) {
            const user = await User.findOne({ username })
            if (user) {
                // we will not changes username if is taken
                username = tempUser.username
            }
        }

        const updatedUser = {
            username,
            bio,
            location,
            full_name,
        }

        const profile = req.files.profile && req.files.profile[0]
        const cover = req.files.cover && req.files.cover[0]

        if (profile) {
            const buffer = fs.readFileSync(profile.path)
            const response = await imagekit.upload({
                file: buffer,
                fileName: profile.originalname
            })

            const url = imagekit.url({
                path: response.filePath,
                transformation: [
                    { quality: "auto" },
                    { format: "webp" },
                    { height: "512" },
                ]
            })

            updatedUser.profile_picture = url
        }

        if (cover) {
            const buffer = fs.readFileSync(cover.path)
            const response = await imagekit.upload({
                file: buffer,
                fileName: cover.originalname
            })

            const url = imagekit.url({
                path: response.filePath,
                transformation: [
                    { quality: "auto" },
                    { format: "webp" },
                    { height: "1280" },
                ]
            })

            updatedUser.cover_photo = url
        }

        const user = await User.findByIdAndUpdate(userId, updatedUser, { new: true })

        return res.json({ success: true, user, message: "Profile Updated Successfully" })
        // res.json({ success: true, user })
    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: error.message })
    }
}

// Find user by name,username,location,email

export const discoverUsers = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { input } = req.body;

        const allUsers = await User.find(
            {
                $or: [
                    { name: new RegExp(input, "i") },
                    { username: new RegExp(input, "i") },
                    { email: new RegExp(input, "i") },
                    { location: new RegExp(input, "i") },
                ]
            }
        )
        const filteredUsers = allUsers.filter(user => user._id !== userId)
        res.json({ success: true, user: filteredUsers })

    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: error.message })
    }
}

// follow users
export const followUsers = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const user = await User.findById(userId)

        if (user.following.includes(id)) {
            res.json({ success: false, message: "You are already following this user" })
        }

        user.following.push(id)
        await user.save()

        const toUser = await User.findById(id)
        toUser.followers.push(userId)
        await toUser.save()

        res.json({ success: true, message: "Now you are following this user" })

    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: error.message })
    }
}

// Unfollow User 
export const unFollowUsers = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const user = await User.findById(userId)
        user.following = user.following.filter(user => user !== id)
        await user.save()

        const toUser = await User.findById(id)
        toUser.followers = toUser.followers.filter(toUser => toUser != userId)
        await toUser.save()

        res.json({ success: false, message: "You are no longer following this user" })


    } catch (error) {
        console.log(error)
        return res.json({ success: false, message: error.message })
    }
}


export const sendConnectionRequests = async (req, res) => {
    try {

        const { userId } = req.auth();
        const { id } = req.body

        // check if the user has sent more than 20 request in 24 hours
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const connectionRequest = await Connection.find({
            from_user_id: userId,
            createdAt: { $gt: last24Hours }
        })
        if (connectionRequest.length >= 20) {
            return res.json({ success: false, message: "You have sent more than 20 connection request in last 24 hours" })
        }

        // check if user is already connected
        const connection = await Connection.find({
            $or: [
                { from_user_id: userId, to_user_id: id },
                { from_user_id: id, to_user_id: userId },

            ]
        })


        if (!connection) {
            await Connection.create({
                from_user_id: userId,
                to_user_id: id
            })
            res.json({ success: true, message: "Connection request sent successfully" })
        }
        else if (connection && connection.status === "accepted") {
            res.json({ success: false, message: "You are already connected with this user" })
        }
        res.json({ success: false, message: "Connection request pending..." })



    } catch (e) {
        return res.json({ success: false, message: error.message })
    }
}


export const getUserConnections = async (req, res) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId).populate("connections followers following")

        const connection = user.connections
        const followers = user.followers
        const following = user.following

        const pendingConnections = (await Connection.find({
            to_user_id: userId,
            status: "pending"
        }).populate("from_user_id").map(connection => { connection.from_user_id }))


        return res.json({ success: true, connection , followers , following , pendingConnections }) 

    } catch (e) {
        return res.json({ success: false, message: error.message })
    }
}



export const acceptUserConnection = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const connection = await Connection.find({from_user_id : id , to_user_id : userId})
        if(!connection){
            return res.json({ success: false, message: "No connection found" })
        }
        
        const user = await User.findById(userId)
        user.connections.push(id)
        await user.save()
        
        const toUser = await User.findById(id)
        toUser.connections.push(userId)
        await toUser.save()
        
        connection.status = "accepted"
        await connection.save()
        
        return res.json({ success: false, message: "Connection accepted successfully" })
    } catch (e) {
        return res.json({ success: false, message: error.message })
    }
}