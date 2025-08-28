import { connections } from "mongoose";
import imagekit from "../config/imageKit.js";
import Connection from "../model/Connection.js";
import Post from "../model/Post.js";
import User from "../model/User.js";
import fs from "fs"
import { inngest } from "../innjest/index.js";


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
        const { id } = req.body;
 
        // Limit to 20 requests in 24 hours
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentRequests = await Connection.find({
            from_user_id: userId,
            createdAt: { $gt: last24Hours }
        });
        if (recentRequests.length >= 20) {
            return res.json({ success: false, message: "You have sent more than 20 connection requests in the last 24 hours" });
        }

        // Check if a connection already exists
        const existingConnection = await Connection.findOne({
            $or: [
                { from_user_id: userId, to_user_id: id },
                { from_user_id: id, to_user_id: userId }
            ]
        });

        if (existingConnection) {
            if (existingConnection.status === "accepted") {
                return res.json({ success: false, message: "You are already connected with this user" });
            } else {
                return res.json({ success: false, message: "Connection request already pending" });
            }
        }

        // Create a new connection request
        const newConnection = await Connection.create({
            from_user_id: userId,
            to_user_id: id,
            status: "pending"
        });

        await inngest.send({
            name: "app/connection-request",
            data: { connectionId: newConnection._id }
        });

        return res.json({ success: true, message: "Connection request sent successfully" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};


export const getUserConnections = async (req, res) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId).populate("connections followers following")

        const connections = user.connections
        const followers = user.followers
        const following = user.following

        const pendingConnectionsRaw = await Connection.find({
            to_user_id: userId,
            status: "pending"
        }).populate("from_user_id");

        const pendingConnections = pendingConnectionsRaw.map(conn => conn.from_user_id);


        return res.json({ success: true, connections, followers, following, pendingConnections })

    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}



export const acceptUserConnection = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const connection = await Connection.findOne({ from_user_id: id, to_user_id: userId })
        if (!connection) {
            return res.json({ success: false, message: "No connection found" })
        }

        const user = await User.findById(userId);
        const toUser = await User.findById(id);

        if (!user.connections.includes(id)) user.connections.push(id);
        if (!toUser.connections.includes(userId)) toUser.connections.push(userId);

        await user.save();
        await toUser.save();

        // Mark connection as accepted
        connection.status = "accepted";
        await connection.save();


        return res.json({ success: false, message: "Connection accepted successfully" })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const getUserProfile = async (req, res) => {
    try {
        const { profileId } = req.body;

        const profile = await User.findById(profileId)

        if (!profile) {
            return res.json({ success: false, message: "Profile not found" })
        }

        const posts = await Post.find({ user: profile }).populate("user")
        return res.json({ success: true, profile, posts })


    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}