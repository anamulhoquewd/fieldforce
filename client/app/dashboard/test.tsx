import React, { useEffect } from 'react'
import { io } from 'socket.io-client'

function TestComponent() {
     useEffect(() => {
        const socket = io(
          process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000",
          {
            withCredentials: true,
          }
        )
    
        socket.on("connect", () => {
          console.log("✅ Connected to server! My id:", socket.id)
        })
    
        socket.on("disconnect", () => {
          console.log("❌ Disconnected")
        })
    
        return () => {
          socket.disconnect()
        }
      }, [])
  return (
    <div>
      Hello
    </div>
  )
}

export default TestComponent
