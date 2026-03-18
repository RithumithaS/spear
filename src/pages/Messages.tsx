import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { auth } from '../firebase';
import { messageApi } from '../services/api';
import { ChatMessage, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { Send, User, Search, MessageSquare } from 'lucide-react';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch chat partners once
  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  // Fallback to polling for messages since we removed real-time Firestore listener
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (user && selectedUser) {
      fetchMessages(); // initial fetch

      // Poll every 3 seconds
      intervalId = setInterval(() => {
        fetchMessages();
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user, selectedUser]);

  const fetchChats = async () => {
    try {
      if (!user) return;
      const partners = await messageApi.getChatPartners(user.uid);
      setChats(partners as UserProfile[]);
    } catch (error) {
      console.error("Error fetching chat partners:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      if (!user || !selectedUser) return;
      const msgs = await messageApi.getConversation(user.uid, selectedUser.uid);
      setMessages(msgs as ChatMessage[]);
      // Scroll smoothly to bottom on new messages
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedUser || !newMessage.trim()) return;

    try {
      await messageApi.send({
        senderId: user.uid,
        receiverId: selectedUser.uid,
        content: newMessage,
        timestamp: new Date().toISOString()
      });
      setNewMessage('');
      fetchMessages(); // Optimistic refresh
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 h-[calc(100vh-120px)]">
        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden h-full flex">
          {/* Sidebar */}
          <div className="w-80 border-r border-white/10 flex flex-col">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-black uppercase tracking-tighter mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading ? (
                <div className="p-4 text-center text-white/40">Loading chats...</div>
              ) : chats.length > 0 ? chats.map(chatUser => (
                <button
                  key={chatUser.uid}
                  onClick={() => setSelectedUser(chatUser)}
                  className={`w-full p-4 rounded-2xl flex items-center space-x-3 transition-colors ${
                    selectedUser?.uid === chatUser.uid ? 'bg-emerald-500 text-black' : 'hover:bg-white/5 text-white/60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 overflow-hidden flex-shrink-0">
                    {chatUser.profileImage ? <img src={chatUser.profileImage} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-2" />}
                  </div>
                  <div className="text-left overflow-hidden">
                    <div className="font-bold text-sm truncate">{chatUser.name}</div>
                    <div className={`text-[10px] uppercase font-bold ${selectedUser?.uid === chatUser.uid ? 'text-black/60' : 'text-white/20'}`}>
                      {chatUser.role}
                    </div>
                  </div>
                </button>
              )) : (
                <div className="text-center py-12 text-white/20 text-xs uppercase tracking-widest">No active chats</div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-black/20">
            {selectedUser ? (
              <>
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 overflow-hidden">
                      {selectedUser.profileImage ? <img src={selectedUser.profileImage} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-2" />}
                    </div>
                    <div>
                      <div className="font-bold">{selectedUser.name}</div>
                      <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Online</div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-4 rounded-2xl text-sm ${
                          msg.senderId === user.uid
                            ? 'bg-emerald-500 text-black rounded-tr-none'
                            : 'bg-zinc-800 text-white rounded-tl-none'
                        }`}
                      >
                        {msg.content}
                        <div className={`text-[10px] mt-1 ${msg.senderId === user.uid ? 'text-black/40' : 'text-white/40'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={scrollRef} />
                </div>

                <form onSubmit={sendMessage} className="p-6 border-t border-white/10 flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 px-6 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="submit"
                    className="p-3 bg-emerald-500 text-black rounded-2xl hover:bg-emerald-400 transition-colors"
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6">
                  <MessageSquare className="w-10 h-10 text-white/10" />
                </div>
                <h3 className="text-xl font-bold mb-2">Select a Conversation</h3>
                <p className="text-white/20 text-sm max-w-xs">Choose a contact from the sidebar to start collaborating.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
