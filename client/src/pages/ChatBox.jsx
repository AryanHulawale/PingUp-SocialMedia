import React, { useEffect, useRef, useState } from 'react'
import { dummyMessagesData, dummyUserData } from '../assets/assets'
import { ImageIcon, SendHorizonal } from 'lucide-react';

const ChatBot = () => {
  const messages = dummyMessagesData;
  const [text, setText] = useState("")
  const [image, setImage] = useState(null)
  const [user, setUser] = useState(dummyUserData)

  const messageEndRef = useRef(null)

  const sendMessage = async () => {

  }
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
            messages.toSorted((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
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
            onChange={() => setText(e.target.value)} value={text} />

          <label htmlFor="image">
            {
              image
                ? <img src={URL.createObjectURL(image)} className='h-8 rounded ml-5' />
                : <ImageIcon className='size-7 text-gray-400 cursor-pointer' />
            }
            <input type="file" id='image' accept='image/*' hidden
              onChange={(e) => setImage(e.target.files[0])} />
          </label>
          <button className='bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 to hover:to-purple-800
          active:scale-95  p-2 cursor-pointer text-white rounded-full'>
            <SendHorizonal size={18}/>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatBot