import React, { useEffect, useRef, useState } from 'react'
import { dummyMessagesData, dummyUserData } from '../assets/assets'
import { ImageIcon, SendHorizonal } from 'lucide-react';
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import { useAuth } from "@clerk/clerk-react"
import api from '../api/axios';
import { addMessages, fetchMessages, resetMessages } from '../features/messages/messagesSlice';
import { } from "react-hot-toast"

const ChatBot = () => {

  const { messages } = useSelector((state) => state.messages)
  const connections = useSelector((state) => state.connections.connections)
  const { userId } = useParams()
  const { getToken } = useAuth()
  const dispatch = useDispatch()


  const [text, setText] = useState("")
  const [image, setImage] = useState(null)
  const [user, setUser] = useState(null)

  const messageEndRef = useRef(null)

  const fetchUserMessages = async () => {
    try {
      const token = await getToken();
      // console.log("Got token:", token);

      const result = await dispatch(fetchMessages({ token, userId }));
      console.log("Dispatch result:", result);


    } catch (error) {
      console.error("fetchUserMessages error:", error);
      toast.error(error?.message || "Unknown error");
    }
  }

  const sendMessage = async () => {
    try {
      if (!image && !text) return


      const formData = new FormData()
      formData.append("to_user_id", userId)
      formData.append("text", text)
      image && formData.append("image", image)

      const token = await getToken();

      const { data } = await api.post("/api/message/send", formData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setText("")
        setImage(null)
        // console.log("message sent")
        dispatch(addMessages(data.message))
        // console.log("message added")
      }
      else {
        throw new Error(data.message)
      }

    } catch (error) {
      console.log(error.message)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    // console.log("useEffect fired with userId:", userId);
    fetchUserMessages()

    return () => {
      dispatch(resetMessages()); // clear messages when switching chats
    };
  }, [userId])

  useEffect(() => {
    if (connections.length > 0) {
      const user = connections.find(connection => connection._id === userId)
      setUser(user)
    }
  }, [userId, connections]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])


  return user && (
    <div className='flex flex-col h-screen'>
      <div className='flex items-center gap-2 p-2 md:px-10 xl:pl-42 
      bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-300'>
        <img src={user.profile_picture} className='size-8 rounded-full'></img>
        <div>
          <p className='font-medium'>{user.full_name}</p>
          <p className='text-sm text-gray-500 -mt-1.5 '>@{user.username}</p>
        </div>
      </div>
      <div className='p-5 md:px-10  h-full overflow-y-scroll'>
        <div className='space-y-4 max-w-4xl mx-auto'>
          {
            [...messages]
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((message, index) => (
                <div key={index} className={`flex flex-col ${message.to_user_id !== user._id
                  ? "items-start" : "items-end"}`}>
                  <div className={`p-2 text-sm  max-w-sm bg-white  text-slate-700 rounded-lg shadow 
                    ${message.to_user_id !== user._id ? "rounded-bl-none" : "rounded-br-none"}`}>
                    {
                      message.message_type === "image" &&
                      <img src={message.media_url} className='w-full max-w-sm rounded-lg  mb-1' />
                    }
                    <p>{message.text}</p>
                  </div>
                </div>
              ))
          }
          <div ref={messageEndRef} />
        </div>
      </div>
      {/* Input field */}
      <div className='p-4'>
        <div className='flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto
        border border-gray-300 shadow rounded-full mb-5'>

          <input type="text" placeholder='Type a message... '
            className='flex-1 outline-none text-slate-700'
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            onChange={(e) => setText(e.target.value)} value={text} />

          <label htmlFor="image">
            {
              image
                ? <img src={URL.createObjectURL(image)} className='h-8 rounded ml-5' />
                : <ImageIcon className='size-7 text-gray-400 cursor-pointer' />
            }
            <input type="file" id='image' accept='image/*' capture="environment" hidden
              onChange={(e) => setImage(e.target.files[0])} />
          </label>
          <button onClick={() => sendMessage()} className='bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 to hover:to-purple-800
          active:scale-95  p-2 cursor-pointer text-white rounded-full'>
            <SendHorizonal size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatBot