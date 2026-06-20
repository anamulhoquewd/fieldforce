'use client';

import Link from 'next/link';

interface Conversation {
  id: string;
  name: string;
  initials: string;
  lastMessage: string;
  timestamp: string;
  unread?: boolean;
  color: string;
}

const conversations: Conversation[] = [
  {
    id: 'alex',
    name: 'Alex Morgan',
    initials: 'AM',
    lastMessage: 'Sounds good — head to Elm St next.',
    timestamp: '5m',
    color: 'bg-blue-200 text-blue-700',
  },
  {
    id: 'northgate',
    name: 'Northgate Crew',
    initials: 'NC',
    lastMessage: 'Dana: anyone carrying a spare 1" motor?',
    timestamp: '18m',
    unread: true,
    color: 'bg-purple-200 text-purple-700',
  },
  {
    id: 'priya',
    name: 'Priya Shah',
    initials: 'PS',
    lastMessage: 'Thanks for covering Pump 3 🔧',
    timestamp: '1h',
    color: 'bg-orange-200 text-orange-700',
  },
];

export default function ChatListPage() {
  return (
    <div className="min-h-screen bg-white md:max-w-2xl md:mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-20">
        <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
      </div>

      {/* Conversations */}
      <div className="divide-y divide-gray-200">
        {conversations.map((conversation) => (
          <Link
            key={conversation.id}
            href={`/worker/chat/${conversation.id}`}
            className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-3"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${conversation.color}`}>
              {conversation.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-gray-900">{conversation.name}</p>
                <span className="text-xs text-gray-500">{conversation.timestamp}</span>
              </div>
              <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
            </div>
            {conversation.unread && (
              <div className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
