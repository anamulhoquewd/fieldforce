"use client"

import { ChevronLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface Message {
  id: string
  sender: "user" | "other"
  text: string
  timestamp: string
}

const chatHistory: Message[] = [
  {
    id: "1",
    sender: "other",
    text: "Morning Marcus — meter swap at 1284 Elm is the priority today.",
    timestamp: "8:02 AM",
  },
  {
    id: "2",
    sender: "user",
    text: "On it. Heading there now.",
    timestamp: "8:05 AM",
  },
  {
    id: "3",
    sender: "other",
    text: "Customer will be home after 9.",
    timestamp: "8:06 AM",
  },
  {
    id: "4",
    sender: "user",
    text: "Done with the meter. Pressure looks good before and after.",
    timestamp: "10:24 AM",
  },
  {
    id: "5",
    sender: "other",
    text: "Sounds good — head to Elm St next.",
    timestamp: "10:25 AM",
  },
]

export default function ChatPage() {
  const [messages, setMessages] = useState(chatHistory)
  const [inputValue, setInputValue] = useState("")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }

    setMessages([...messages, newMessage])
    setInputValue("")
  }

  return (
    <div className="flex h-screen flex-col bg-white md:flex-row">
      {/* Chat List - Desktop Sidebar */}
      <div className="hidden md:flex md:w-80 md:flex-col md:border-r md:border-gray-200 md:bg-gray-50">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-bold text-gray-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Link
            href="/worker/chat"
            className="block border-b border-gray-200 p-4 transition-colors hover:bg-gray-100"
          >
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-200 text-sm font-semibold text-blue-700">
                AM
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Alex Morgan
                </p>
                <p className="truncate text-xs text-gray-500">
                  Sounds good — head to Elm St next.
                </p>
              </div>
              <span className="text-xs text-gray-500">10:25 AM</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 md:py-4">
          <Link href="/worker/chat" className="md:hidden">
            <ChevronLeft size={24} className="text-gray-700" />
          </Link>
          <div>
            <h1 className="font-semibold text-gray-900 md:text-lg">
              Alex Morgan
            </h1>
            <p className="text-xs text-teal-600">Online</p>
          </div>
          <button className="ml-auto rounded-lg p-2 hover:bg-gray-100 md:hidden">
            <svg
              className="h-5 w-5 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs rounded-lg px-4 py-2 ${
                  message.sender === "user"
                    ? "rounded-br-none bg-blue-600 text-white"
                    : "rounded-bl-none bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p
                  className={`mt-1 text-xs ${message.sender === "user" ? "text-blue-100" : "text-gray-500"}`}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSendMessage}
          className="sticky bottom-0 flex gap-3 border-t border-gray-200 bg-white px-4 py-3 md:py-4"
        >
          <input
            type="text"
            placeholder="Message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  )
}
