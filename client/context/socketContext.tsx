"use client"

import React, { createContext, useContext, useEffect, useMemo } from "react"
import { io, Socket } from "socket.io-client"
import { useUser } from "./authContext"

const SocketContext = createContext<Socket | null>(null)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser()

  const socket = useMemo<Socket | null>(() => {
    if (!user?.userId) {
      return null
    }

    return io(process.env.NEXT_PUBLIC_SOCKET_URL || undefined, {
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })
  }, [user?.userId])

  useEffect(() => {
    return () => {
      socket?.disconnect()
    }
  }, [socket])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
