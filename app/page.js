import Link from 'next/link'
import React from 'react'

function page() {
  return (
    <section className='h-screen w-full flex justify-center items-center gap-6'>
      <Link className='text-4xl font-extrabold tracking-tight border border-black/30 p-3 rounded-md hover:bg-black hover:text-white hover:border-white/30 transition-all ease-in-out duration-150 ' href={'/tambola'} >Tambola</Link>
      <Link className='text-4xl font-extrabold tracking-tight border border-black/30 p-3 rounded-md hover:bg-black hover:text-white hover:border-white/30 transition-all ease-in-out duration-150 ' href={'/among-us'} >Among Us</Link>
    </section>
  )
}

export default page