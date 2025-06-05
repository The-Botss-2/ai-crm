"use client"
import Sidebar from '@/components/sidebar'
import React, { useState } from 'react'
interface Props {
    children: React.ReactNode,
    pathname: string,
    id: string,
    session: any
}
const Main = ({id, pathname, session, children}:Props) => {
    const [isOpen, setIsOpen] = useState(true);
  return (
   <>
   <Sidebar team_id={id} pathname={pathname}  session={session} isOpen={isOpen} setIsOpen={setIsOpen}/>
   <div className={`flex-1 pl-16 ${isOpen ? 'lg:pl-64' : ''} transition-all duration-300`}>
       <main>
           {children}
       </main>
   </div></>
  )
}

export default Main