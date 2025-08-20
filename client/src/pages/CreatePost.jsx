import React, { useState } from 'react'
import Loading from '../components/Loading'
import { dummyUserData } from '../assets/assets'
import { Image, X } from 'lucide-react'
import toast from 'react-hot-toast'

const CreatePost = () => {

  const [content, setContent] = useState("")
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

  const user = dummyUserData

  const handleSubmit = async () => {

  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
      <div className='max-w-6xl mx-auto p-6'>
        {/* Tittle */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Create Post</h1>
          <p className='text-slate-600'>Share your thoughts with the World</p>
        </div>

        {/* form */}
        <div className='max-w-xl bg-white p-4 sm:p-8 sm:pb-3 rounded-xl shadow-md space-y-4'>
          <div className='flex items-center gap-3'>
            <img src={user.profile_picture} alt=""
              className='w-12 h-12 rounded-full shadow' />
            <div>
              <h1 className='font-semibold'>{user.full_name}</h1>
              <p className='text-sm text-gray-500'>@{user.username}</p>
            </div>
          </div>

          {/* Textarea */}
          <textarea className='w-full resize-none max-h-20 mt-4 text-sm  outline-none 
        placeholder-gray-400' placeholder="What's happening ?"
            onChange={(e) => setContent(e.target.value)} value={content} />
          {/* Images */}
          {
            images.length > 0 && <div className='flex flex-wrap gap-2 mt-4'>
              {
                images.map((image, i) => (
                  <div key={i} className='relative group'>
                    <img src={URL.createObjectURL(image)} className='h-20 rounded-md' />
                    <div onClick={() => setImages(images.filter((_, index) => index !== i))}
                      className='absolute hidden group-hover:flex justify-center items-center 
                  top-0 bottom-0 left-0 right-0 bg-black/40 rounded-md cursor-pointer'>
                      <X className='w-6 h-6 text-white' />
                    </div>
                  </div>
                ))
              }
            </div>
          }
          {/* Bottom Bar */}


          <div className='flex items-center justify-between pt-3 border-t border-gray-300'>
            <label htmlFor='images' className='flex items-center gap-2 text-sm text-gray-500
            hover:text-gray-700 transition cursor-pointer'>
              <Image className='size-6' />
            </label>
            <input type="file" id="images" accept='image/*' hidden multiple
              onChange={(e) =>
                setImages((prev) => [...prev, ...Array.from(e.target.files)])
              }

            />
            <button disabled={loading} onClick={() => toast.promise(
              handleSubmit(),
              {
                loading: "uploading...",
                success: <p>Post Added </p>,
                error: <p>Post Not Added </p>
              })}
              className='text-sm bg-gradient-to-r from-indigo-500 to-purple-600 
             hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white 
             font-medium px-8 py-2 rounded-md cursor-pointer'>
              Publish Post
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default CreatePost