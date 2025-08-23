import express from "express"
import cors from "cors"
import "dotenv/config"
import connectDb from "./config/db.js"
import { inngest, functions } from "./innjest/index.js"
import { serve } from "inngest/express"

import { clerkMiddleware } from '@clerk/express'
import userRouter from "./routes/userRoutes.js"


const app = express()

// await connectDb();
await connectDb()

app.use(express.json())
app.use(cors())

app.use("/api/inngest", serve({ client: inngest, functions }));

app.use(clerkMiddleware())

app.use("/api/user", userRouter)


app.get("/", (req, res) => {
    res.send("The Server is Running ")
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
    console.log("Server is Running")
})
