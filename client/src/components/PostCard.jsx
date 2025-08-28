import { BadgeCheck, Heart, MessageCircle, MessageCircleIcon, Share2 } from 'lucide-react'
import React, { useState } from 'react'
import moment from 'moment'
import { dummyUserData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useSelector } from "react-redux"
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useAuth } from '@clerk/clerk-react'

const PostCard = ({ post }) => {

  const navigate = useNavigate()
  const { getToken } = useAuth()

  const postsWithHastags = post.content.replace(/(#\w+)/g, "<span class='text-indigo-600'>$1</span>")

  const [likes, setLikes] = useState(post.like_counts || [])
  const currentUser = useSelector((state) => state.user.value);

  const handleLike = async () => {
    try {
      const token = await getToken()
      const { data } = await api.post("/api/post/like", { postId: post._id }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        toast.success(data.message)
        setLikes(prev => {
          if (prev.includes(currentUser._id)) {
            return prev.filter((id) => id !== currentUser._id)
          } else {
            return [...prev, currentUser._id]
          }
        })

      } else {
        toast.error(error.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }


  return (
    <div className='bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl'>

      {/* User Details */}
      <div onClick={() => navigate("/profile/" + (post?.user?._id || post.user))}
        className='inline-flex items-center gap-3 cursor-pointer'>
        <img src={post?.user.profile_picture} className='w-10 h-10 rounded-full shadow' />
        <div>
          <div className='flex items-center space-x-1'>
            <span>{post?.user.full_name}</span>
            <BadgeCheck className='w-4 h-4 text-blue-500' />
          </div>
          <div className='text-sm text-gray-500'>@{post?.user.username} ● {moment(post.createdAt).fromNow()}</div>
        </div>
      </div>

      {/* User content */}
      {post.content && <div className='text-gray-800 text-sm whitespace-pre-line'
        dangerouslySetInnerHTML={{ __html: postsWithHastags }} />}

      {/* Images */}
      <div className='grid grid-cols-2 gap-2'>
        {
          post.image_urls.map((img, index) => (
            <img src={img} key={index} className={` w-full h-48  object-cover rounded-lg ${post.image_urls.length === 1 && "col-span-2 h-auto"}`} />
          ))
        }
      </div>
      {/* Util */}
      <div className='flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300'>
        <div onClick={handleLike}  className='flex items-center gap-1 cursor-pointer'>
          <Heart 
            className={`w-4 h-4 cursor-pointer ${likes.includes(currentUser._id) && " text-red-500 fill-red-500"}`} />
          <span>{likes.length}</span>
        </div>
        <div className='flex items-center gap-1'>
          <MessageCircle
            className="w-4 h-4" />
          <span>{12}</span>
        </div>
        <div className='flex items-center gap-1'>
          <Share2
            className="w-4 h-4" />
          <span>{7}</span>
        </div>
      </div>
    </div>
  )
}

export default PostCard