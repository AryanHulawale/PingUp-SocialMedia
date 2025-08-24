import { Inngest } from "inngest";
import User from "../model/User.js";
import Connection from "../model/Connection.js";
import sendEmail from "../config/nodeMailer.js";
import Story from "../model/Story.js";
import Message from "../model/Message.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "pingup-app" });

// innjest function to add new user to database by clerk 
const syncUserCreation = inngest.createFunction(
    { id: "sync-user-from-clerk" },
    { event: "clerk/user.created" },

    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;
        let username = email_addresses[0].email_address.split("@")[0];

        // ✅ Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            username = username + Math.floor(Math.random() * 10000);
        }

        const createUser = {
            _id: id,
            email: email_addresses[0].email_address,
            full_name: `${first_name} ${last_name}`,
            profile_picture: image_url,
            username: username
        };

        await User.create(createUser);
    }
);

// innjest function to update user
const syncUserUpdation = inngest.createFunction(
    { id: "update-user-from-clerk" },
    { event: "clerk/user.updated" },

    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data;

        const updateUserData = {
            email: email_addresses[0].email_address,
            full_name: `${first_name} ${last_name}`,
            profile_picture: image_url,
        };

        await User.findByIdAndUpdate(id, updateUserData);
    }
);

// innjest function to delete user
const syncUserDeletion = inngest.createFunction(
    { id: "delete-user-from-clerk" },
    { event: "clerk/user.deleted" },

    async ({ event }) => {
        const { id } = event.data;
        await User.findByIdAndDelete(id);
    }
);

// innjest function to send email that new connection request is sent 
const sendNewConnectionRequestRemainder = inngest.createFunction(
    { id: "send-new-connection-request-remainder" },
    { event: "app/connection-request" },
    async ({ event, step }) => {
        const connectionId = event.data;

        await step.run("send-connection-request-mail", async () => {

            const connection = await Connection.findById(connectionId).populate("from_user_id to_user_id")
            const subject = " 👋 New Connection Request "

            const body = `<div style="font-family: Arial, Helvetica, sans-serif; padding: 20px ">
            <h2>Hi ${connection.to_user_id.full_name},</h2>
            <p>You have new connection request from ${connection.to_user_id.full_name} - @${connection.to_user_id.username}</p>
            <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #1753f5dd;">here</a> to accept or reject the request</p>
            <br>
            <p>Thanks,<br/>PingUp - Stay Connected</p>
            </div>`

            await sendEmail({
                to: connection.to_user_id.email,
                subject,
                body
            })
        })

        const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000)
        await step.sleepUntil("wait-for-24-hours", in24Hours)

        await step.run("send-connection-remainder-email", async () => {

            const connection = await Connection.findById(connectionId).populate("from_user_id to_user_id")

            if (connection.status == "accepted") {
                return { message: "Already connected" }
            }

            const subject = " 👋 New Connection Request "
            const body = `<div style="font-family: Arial, Helvetica, sans-serif; padding: 20px ">
            <h2>Hi ${connection.to_user_id.full_name},</h2>
            <p>You have new connection request from ${connection.to_user_id.full_name} - @${connection.to_user_id.username}</p>
            <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #1753f5dd;">here</a> to accept or reject the request</p>
            <br>
            <p>Thanks,<br/>PingUp - Stay Connected</p>
            </div>`

            await sendEmail({
                to: connection.to_user_id.email,
                subject,
                body
            })

        })

        return { message: "Remainder Sent." }

    }
)

const deleteStory = inngest.createFunction(
    { id: "delete-story" },
    { event: "app/story.delete" },
    async ({ event, step }) => {
        const { storyId } = event.data
        last24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000)
        await step.sleepUntil("wait-for-24-hours", last24Hours)
        await step.run("story-delete", async () => {
            await Story.findByIdAndDelete(storyId)
            return { message: "Story deleted" }
        })
    }
)

const sendNotificationOfUnseenMessages = inngest.createFunction(
    { id: "send-unseen-message-notification" },
    { cron: "CRON_TZ=Asia/Kolkata 0 9 * * *" },
    async ({ step }) => {
        const messages = await Message.find({ seen: false }).populate("to_user_id")

        const unseenCount = {}

        messages.map((message) => {
            unseenCount[message.to_user_id._id] = (unseenCount[message.to_user_id._id] || 0) + 1;
        })

        for (const userId in unseenCount) {
            const user = await User.findById(userId)
            const subject = `You have ${unseenCount[userId]} unseen messages`
            const body = `<div style="font-family: Arial, Helvetica, sans-serif; padding: 20px ">
                            <h2>Hi ${user.full_name},</h2>
                            <p>You have ${unseenCount[userId]} unseen messages</p>
                            <p>Click <a href="${process.env.FRONTEND_URL}/messages" style="color: #1753f5dd;">here</a> to accept or reject the request</p>
                            <br>
                            <p>Thanks,<br/>PingUp - Stay Connected</p>
                        </div>`

            await sendEmail({
                to: user.email,
                subject,
                body
            })
        }
 
        return { message: "Notification Sent." }
    }
)

// Export all functions
export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
    sendNewConnectionRequestRemainder,
    deleteStory,
    sendNotificationOfUnseenMessages
];
