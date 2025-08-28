import React, { use, useEffect, useState } from 'react'
import { dummyConnectionsData } from '../assets/assets'
import { Loader, Search } from 'lucide-react'
import UserCard from '../components/UserCard'
import Loading from '../components/Loading'
import api from '../api/axios'
import { useAuth } from "@clerk/clerk-react"
import toast, { } from "react-hot-toast"
import { useDispatch } from 'react-redux'
import { fetchUser } from '../features/users/userSlice'

const Discover = () => {

  const dispatch = useDispatch()

  const [input, setInput] = useState("")
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  const { getToken } = useAuth()


  const handleInput = async (e) => {
    if (e.key === "Enter") {
      try {
        setUsers([])
        setLoading(true)
        const { data } = await api.post("/api/user/discover", { input }, {
          headers: { Authorization: `Bearer ${await getToken()}` }
        })
        data.success ? setUsers(data.user) : toast(data.message)
        setLoading(false)
        setInput("")
      } catch (error) {
        toast.error(error.message)
      }
      setLoading(false)
    }
  }


  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken()
      dispatch(fetchUser(token))
    }
    fetchData()
  }, [])


  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
      <div className='max-w-6xl mx-auto p-6'>
        {/* Title */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Discover People</h1>
          <p className='text-slate-600'>Connect with amazing people and grow your network </p>
        </div>

        {/* search */}
        <div className='mb-8 shadow-md rounded-md border border-slate-200/60 bg-white/80'>
          <div className='p-6'>
            <div className='relative '>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 
              w-5 h-5 text-slate-400'/>
              <input type="text" placeholder='Search people by name, username, bio or location...'
                className='pl-10 sm:pl-12 py-2 w-full border border-gray-300 rounded-md max-sm:text-sm'
                onChange={(e) => setInput(e.target.value)}
                value={input} onKeyUp={handleInput} />
            </div>
          </div>
        </div>

        {/* Crads */}
        <div className='flex flex-wrap gap-6 '>
          {
            users.map((user) => (
              <UserCard user={user} key={user._id} />
            ))
          }
        </div>
        {
          loading && <Loading height='60vh' />
        }
      </div>
    </div>
  )
}

export default Discover