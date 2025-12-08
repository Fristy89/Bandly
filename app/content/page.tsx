'use client';

import Navigation from '@/components/Navigation';
import { useState } from 'react';

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'collaborate' | 'posts'>(
    'chat'
  );
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    null
  );
  const [messageInput, setMessageInput] = useState('');

  const conversations = [
    {
      id: '1',
      participantName: 'Luna Beats',
      participantImage: '🎵',
      lastMessage: 'Sounds great! When can we record together?',
      timestamp: '2 hours ago',
      unread: true,
      messages: [
        {
          id: '1',
          senderId: 'user',
          senderName: 'You',
          content: 'Hey! Love your electronic sound',
          timestamp: '10:30 AM',
        },
        {
          id: '2',
          senderId: 'luna',
          senderName: 'Luna Beats',
          content: 'Thanks! Your indie rock vibes are amazing',
          timestamp: '10:35 AM',
        },
        {
          id: '3',
          senderId: 'user',
          senderName: 'You',
          content: 'Want to collaborate on a track?',
          timestamp: '10:45 AM',
        },
        {
          id: '4',
          senderId: 'luna',
          senderName: 'Luna Beats',
          content: 'Sounds great! When can we record together?',
          timestamp: '11:00 AM',
        },
      ],
    },
    {
      id: '2',
      participantName: 'Jazz Collective',
      participantImage: '🎷',
      lastMessage: 'Interested in the gala booking',
      timestamp: '5 hours ago',
      unread: false,
      messages: [
        {
          id: '1',
          senderId: 'jazz',
          senderName: 'Jazz Collective',
          content: 'Hi! Are you interested in our music?',
          timestamp: '3:00 PM',
        },
        {
          id: '2',
          senderId: 'user',
          senderName: 'You',
          content: 'Definitely! Can you play at our gala?',
          timestamp: '3:15 PM',
        },
        {
          id: '3',
          senderId: 'jazz',
          senderName: 'Jazz Collective',
          content: 'Interested in the gala booking',
          timestamp: '3:30 PM',
        },
      ],
    },
    {
      id: '3',
      participantName: 'Soul Speakers',
      participantImage: '🎤',
      lastMessage: 'Let me know about the venue details',
      timestamp: '1 day ago',
      unread: false,
      messages: [],
    },
  ];

  const collaborationProjects = [
    {
      id: '1',
      title: 'Summer Festival Collab',
      collaborators: ['Luna Beats', 'The Echo Band'],
      status: 'in-progress',
      description:
        'Creating a special medley for the summer festival performance',
    },
    {
      id: '2',
      title: 'Jazz Fusion Experiment',
      collaborators: ['Jazz Collective', 'Soul Speakers'],
      status: 'in-progress',
      description:
        'Blending jazz with modern soul influences for a unique sound',
    },
    {
      id: '3',
      title: 'Charity Album',
      collaborators: ['The Echo Band', 'Luna Beats', 'Jazz Collective'],
      status: 'planning',
      description: 'Multi-artist benefit album for local music programs',
    },
  ];

  const recentPosts = [
    {
      id: '1',
      author: 'Luna Beats',
      authorImage: '🎵',
      content:
        'Just finished a new track! Super excited to share it with everyone 🎧✨',
      timestamp: '3 hours ago',
      likes: 245,
      comments: 34,
    },
    {
      id: '2',
      author: 'Jazz Collective',
      authorImage: '🎷',
      content:
        'Amazing gig last night at the Grand Hotel! Thanks for having us 🎉',
      timestamp: '5 hours ago',
      likes: 156,
      comments: 22,
    },
    {
      id: '3',
      author: 'Soul Speakers',
      authorImage: '🎤',
      content: "New collaboration announcement coming soon! 👀 Stay tuned",
      timestamp: '1 day ago',
      likes: 89,
      comments: 18,
    },
  ];

  const currentConversation = conversations.find(
    (c) => c.id === selectedConversation
  );

  const handleSendMessage = () => {
    if (messageInput.trim() && currentConversation) {
      currentConversation.messages.push({
        id: String(currentConversation.messages.length + 1),
        senderId: 'user',
        senderName: 'You',
        content: messageInput,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
      setMessageInput('');
    }
  };

  return (
    <>
      <Navigation />
      <main className="pt-20 min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Content & Community</h1>
            <p className="text-gray-400">
              Connect with other artists, collaborate, and share your work
            </p>
          </div>

          <div className="flex border-b border-gray-800 mb-8">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'border-b-2 border-purple-500 text-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              💬 Messages
            </button>
            <button
              onClick={() => setActiveTab('collaborate')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'collaborate'
                  ? 'border-b-2 border-purple-500 text-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🎵 Collaborations
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'posts'
                  ? 'border-b-2 border-purple-500 text-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📝 Feed
            </button>
          </div>

          {activeTab === 'chat' && (
            <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
              <div className="bg-gray-900 rounded-lg overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-800">
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="flex-1 overflow-y-auto">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`w-full p-4 text-left border-b border-gray-800 hover:bg-gray-800 transition-colors ${
                        selectedConversation === conversation.id
                          ? 'bg-gray-800'
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">
                          {conversation.participantImage}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold truncate">
                              {conversation.participantName}
                            </h3>
                            {conversation.unread && (
                              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 truncate">
                            {conversation.lastMessage}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {conversation.timestamp}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedConversation && currentConversation ? (
                <div className="lg:col-span-2 bg-gray-900 rounded-lg flex flex-col">
                  <div className="p-4 border-b border-gray-800 flex items-center gap-3">
                    <span className="text-3xl">
                      {currentConversation.participantImage}
                    </span>
                    <h2 className="text-xl font-bold">
                      {currentConversation.participantName}
                    </h2>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {currentConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === 'user'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            message.senderId === 'user'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-800 text-gray-300'
                          }`}
                        >
                          <p className="text-sm font-semibold mb-1">
                            {message.senderName}
                          </p>
                          <p>{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-gray-800 flex gap-3">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === 'Enter' && handleSendMessage()
                      }
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-medium transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className="lg:col-span-2 bg-gray-900 rounded-lg flex items-center justify-center text-gray-400">
                  <p>Select a conversation to start messaging</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'collaborate' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2 bg-purple-900 rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-2">Start a Collaboration</h2>
                <p className="text-gray-300 mb-4">
                  Find artists to collaborate with or create a new project
                </p>
                <button className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-medium transition-colors">
                  Create New Project
                </button>
              </div>

              {collaborationProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-900 rounded-lg p-6 border border-gray-800"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold">{project.title}</h3>
                    <span
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        project.status === 'in-progress'
                          ? 'bg-green-900 text-green-300'
                          : 'bg-blue-900 text-blue-300'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-4">{project.description}</p>
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Collaborators:</p>
                    <div className="flex flex-wrap gap-2">
                      {project.collaborators.map((collaborator) => (
                        <span
                          key={collaborator}
                          className="bg-gray-800 px-3 py-1 rounded text-sm"
                        >
                          {collaborator}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-medium transition-colors text-sm">
                    View Project
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="max-w-2xl">
              <div className="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">😊</span>
                  <div className="flex-1">
                    <textarea
                      placeholder="Share your latest work, thoughts, or updates..."
                      rows={3}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                    ></textarea>
                    <div className="flex justify-end mt-3">
                      <button className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-medium transition-colors">
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-gray-900 rounded-lg p-6 border border-gray-800"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{post.authorImage}</span>
                      <div>
                        <h3 className="font-bold">{post.author}</h3>
                        <p className="text-sm text-gray-400">{post.timestamp}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4">{post.content}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <button className="hover:text-purple-400 transition-colors">
                        ❤️ {post.likes}
                      </button>
                      <button className="hover:text-purple-400 transition-colors">
                        💬 {post.comments}
                      </button>
                      <button className="hover:text-purple-400 transition-colors">
                        📤 Share
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
