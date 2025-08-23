import React from 'react'
import { Routes, Route } from "react-router-dom"
import Login from "./pages/Login.jsx"
import ChatBox from "./pages/ChatBox.jsx"
import Connections from "./pages/Connections"
import CreatePost from "./pages/CreatePost"
import Discover from "./pages/Discover"
import Layout from "./pages/Layout"
import Profile from "./pages/Profile"
import Messages from "./pages/Message"
import Feed from "./pages/Feed"
import { useUser, useAuth } from '@clerk/clerk-react'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'

const App = () => {

  const { user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    if (user) {
      getToken().then((token) => console.log(token))
    }  
  }, [user])

  return (
    <>
      <Toaster />
      <Routes>
        <Route path='/' element={!user ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:userId" element={<ChatBox />} />
          <Route path="connections" element={<Connections />} />
          <Route path="discover" element={<Discover />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:profileId" element={<Profile />} />
          <Route path="create-post" element={<CreatePost />} />
        </Route>
      </Routes>
    </>
  )
}

export default App