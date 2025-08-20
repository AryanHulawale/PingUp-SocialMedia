import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { dummyPostsData, dummyUserData } from '../assets/assets'
import { useEffect } from 'react'
import Loading from '../components/Loading'
import UserProfileInfo from '../components/UserProfileInfo'
import PostCard from '../components/PostCard'
import { Link } from 'lucide-react'
import moment from 'moment/moment'
import ProfileModal from '../components/ProfileModal'

const Profile = () => {

  const { profileId } = useParams()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [activeTab, setActiveTab] = useState("posts")
  const [showEdit, setShowEdit] = useState(false)


  const fetchUser = async () => {
    setUser(dummyUserData)
    setPosts(dummyPostsData)
  }

  useEffect(() => {
    fetchUser()
  }, []);

  return user ? (
    <div className='relative h-full overflow-y-scroll bg-gray-50 p-6 '>
      <div className='max-w-3xl mx-auto'>
        {/* Profile Card */}
        <div className='bg-white rounded-2xl shadow overflow-hidden'>
          {/* cpver photo */}
          <div className='h-40 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200'>
            {user.cover_photo && <img src={user.cover_photo} className='w-full h-full object-cover' />}
          </div>
          {/* user info */}
          <UserProfileInfo user={user} profileId={profileId} posts={posts} setShowEdit={setShowEdit} />
        </div>
        {/* Tabs */}
        <div className='mt-6'>
          <div className='bg-white rounded-xl shadow p-1 flex max-w-md mx-auto'>
            {["posts", "media", "likes"].map((tab) => (
              <button onClick={() => setActiveTab(tab)}
                key={tab} className={` flex-1 px-4 py-2  text-sm font-medium rounded-lg transition-colors cursor-pointer 
              ${activeTab === tab ? " bg-indigo-600 text-white" : "text-gray-600 hover:text-gray-900 "}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          {/* Posts */}
          {
            activeTab === "posts" && (
              <div className='mt-6 flex flex-col items-center gap-6'>
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )
          }
          {
            activeTab === "media" && (
              <div className='mt-6 flex flex-wrap max-w-6xl'>
                {
                  posts.filter((post) => post.image_urls.length > 0).map((post) => (
                    <>
                      {post.image_urls.map((image, index) => (
                        <a target='_blank' to={image} key={index}
                        className='relative group'>
                          <img src={image} key={index} 
                          className='w-64 object-cover aspect-video' />
                          <p className='absolute bottom-0 right-0 text-xs p-1 px-3 
                          backdrop-blur-xl text-white opacity-0 group-hover:opacity-100 
                          transition duration-300'>Posted {moment(post.createdAt).fromNow()}</p>
                        </a>
                      ))}
                    </>
                  ))
                }
              </div>
            )
          }
        </div>
      </div>
      {
        showEdit && <ProfileModal setShowEdit={setShowEdit}/>
      }
    </div>
  ) : (<Loading />)
}

export default Profile