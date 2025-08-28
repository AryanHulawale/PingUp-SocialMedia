import fs from "fs"
import imagekit from "../config/imageKit.js";
import Post from "../model/Post.js";
import User from "../model/User.js";
// Add Post
export const addPosts = async (req, res) => {
    try {

        const { userId } = req.auth();
        const { content, post_type } = req.body || {}

        let images = req.files || []

        let image_urls = []
        if (images.length) {
            image_urls = await Promise.all(
                images.map(async (image) => {

                    const buffer = fs.readFileSync(image.path)
                    const response = await imagekit.upload({
                        file: buffer,
                        fileName: image.originalname,
                        folder: "posts"
                    })

                    const url = imagekit.url({
                        path: response.filePath,
                        transformation: [
                            { quality: "auto" },
                            { format: "webp" },
                            { height: "512" },
                        ]
                    })

                    return url

                })
            )
        }

        await Post.create({
            user: userId,
            content,
            image_urls,
            post_type
        });


        res.json({ success: true, message: "Post created successfully" })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Post
export const getFeedPosts = async (req, res) => {
    try {
        const { userId } = req.auth();
        const currentUser = await User.findById(userId);

        const connections = Array.isArray(currentUser.connections) ? currentUser.connections : [];
        const following = Array.isArray(currentUser.following) ? currentUser.following : [];

        const userIds = [userId, ...connections, ...following];

        
        const posts = await Post.find({ user: { $in: userIds } }).sort({ createdAt: -1 });

       
        const authorIds = [...new Set(posts.map(p => p.user))];

        const authors = await User.find({ _id: { $in: authorIds } });

      
        const authorsMap = Object.fromEntries(authors.map(a => [a._id.toString(), a]));

        // Map posts with proper user details
        const postsWithUser = posts.map(post => {
            const author = authorsMap[post.user.toString()];
            return {
                ...post.toObject(),
                user: {
                    _id: post.user,
                    full_name: author?.full_name || "Unknown User",
                    username: author?.username || "username",
                    profile_picture: author?.profile_picture || "/default-avatar.png"
                }
            };
        });

        res.json({ success: true, posts: postsWithUser });


    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Like
export const likePost = async (req, res) => {
    try {

        const { userId } = req.auth();
        const { postId } = req.body;

        const post = await Post.findById(postId)

        if (post.like_counts.includes(userId)) {
            // dislike
            post.like_counts = post.like_counts.filter(user => user !== userId)
            await post.save()
            res.json({ success: true, message: "Post Disliked" })
        } else {
            // like
            post.like_counts.push(userId)
            await post.save()
            res.json({ success: true, message: "Post Liked" })
        }

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}