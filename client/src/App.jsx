import React, { useRef } from 'react'
import { Routes, Route, useLocation } from "react-router-dom"
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
import toast, { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { useDispatch } from "react-redux"
import { fetchUser } from './features/users/userSlice.js'
import { fetchConnections } from './features/connections/connectionsSlice.js'
import { addMessages } from './features/messages/messagesSlice.js'
import Notification from './components/Notification.jsx'

const App = () => {

  const { user } = useUser();
  const { getToken } = useAuth();
  const dispatch = useDispatch()

  const location = useLocation()
  const pathnameRef = useRef(location.pathname)

  useEffect(() => {

    const fetchData = async () => {
      if (user) {
        const token = await getToken()
        dispatch(fetchUser(token))
        dispatch(fetchConnections(token))
      }
    }
    fetchData()

  }, [user, getToken, dispatch])

  useEffect(() => {
    pathnameRef.current = location.pathname
  }, [location.pathname])

  useEffect(() => {
    if (!user) return;

    const eventSource = new EventSource(
      `${import.meta.env.VITE_BASEURL}/api/message/${user.id}`
    );

    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received SSE message:", message);

      const currentPath = location.pathname; // use latest path
      const targetPath = `/message/${message.from_user_id._id}`;

      if (currentPath.startsWith(targetPath)) {
        dispatch(addMessages(message));
      } else {
        toast.custom((t) => <Notification t={t} message={message} />, {
          position: "bottom-right",
        });
      }
    };

    return () => eventSource.close();
  }, [user, dispatch, location]);

  return (
    <>
      <Toaster />
      <Routes>
        <Route path='/' element={!user ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path="message" element={<Messages />} />
          <Route path="message/:userId" element={<ChatBox />} />
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