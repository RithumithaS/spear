import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { auth } from '../firebase';
import { messageApi, connectionApi, userApi } from '../services/api';
import { ChatMessage, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { Send, User, Search, MessageSquare, Users } from 'lucide-react';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [chats, setChats] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check for preselected user from navigation state
  useEffect(() => {
    const state = location.state as { preselectedUser?: UserProfile } | null;
    if (state?.preselectedUser) {
      setSelectedUser(state.preselectedUser);
    }
  }, [location.state]);

  // Fetch chat partners once
  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  // Polling for messages
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (user && selectedUser) {
      fetchMessages();
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
      const partnerList = partners as UserProfile[];
      setChats(partnerList);

      // If we have a preselected user that's not already in the chat list, add them
      const state = location.state as { preselectedUser?: UserProfile } | null;
      if (state?.preselectedUser) {
        const exists = partnerList.some(p => p.uid === state.preselectedUser!.uid);
        if (!exists) {
          setChats([state.preselectedUser, ...partnerList]);
        }
      }
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
      });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const filteredChats = chats.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-80px)]">
        <div className="bg-white border border-slate-200 shadow-xl rounded-3xl overflow-hidden h-full flex drop-shadow-sm">
          {/* Sidebar */}
          <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
            <div className="p-6 border-b border-slate-200 bg-white">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-5 relative inline-block">
                Messages
                <div className="absolute -bottom-1 left-0 w-1/2 h-1 bg-emerald-500 rounded-full" />
              </h2>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading ? (
                <div className="p-4 flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredChats.length > 0 ? filteredChats.map(chatUser => (
                <button
                  key={chatUser.uid}
                  onClick={() => setSelectedUser(chatUser)}
                  className={`w-full p-4 rounded-2xl flex items-center space-x-3 transition-all ${
                    selectedUser?.uid === chatUser.uid 
                      ? 'bg-white border border-slate-200 shadow-md transform scale-[1.02]' 
                      : 'hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm grayscale-[0.5] hover:grayscale-0'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm relative">
                    {chatUser.profileImage ? <img src={chatUser.profileImage} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-3 text-slate-400" />}
                    {selectedUser?.uid === chatUser.uid && (
                      <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="text-left overflow-hidden flex-1">
                    <div className="font-bold text-slate-900 text-[15px] truncate">{chatUser.name}</div>
                    <div className="text-xs font-semibold text-emerald-600 uppercase tracking-widest truncate mt-0.5">
                      {chatUser.role.replace('_', ' ')}
                    </div>
                  </div>
                </button>
              )) : (
                <div className="text-center py-12 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                    <Users className="w-6 h-6 text-slate-300" />
                  </div>
                  <div className="text-slate-900 font-bold mb-1">No active chats</div>
                  <p className="text-slate-500 text-sm max-w-[200px]">Connect with people first to start collaborating!</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
            {selectedUser ? (
              <>
                <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white z-10 shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm">
                      {selectedUser.profileImage ? <img src={selectedUser.profileImage} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-3 text-slate-400" />}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-lg leading-tight">{selectedUser.name}</div>
                      <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">{selectedUser.role?.replace('_', ' ')}</div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 bg-slate-50/30">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <MessageSquare className="w-12 h-12 mb-4 text-slate-300" />
                      <p className="font-medium text-slate-500">No messages yet. Say hello! 👋</p>
                    </div>
                  )}
                  {messages.map((msg, idx) => {
                    const isMe = msg.senderId === user.uid;
                    return (
                      <div
                        key={idx}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}
                      >
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`max-w-[85%] sm:max-w-[70%] px-5 py-3.5 rounded-2xl text-[15px] font-medium leading-relaxed shadow-sm ${
                              isMe
                                ? 'bg-emerald-600 text-white rounded-tr-sm'
                                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                            }`}
                          >
                            {msg.content}
                          </div>
                          <div className={`text-[11px] mt-1.5 font-semibold ${isMe ? 'text-slate-400' : 'text-slate-400'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={scrollRef} />
                </div>

                <form onSubmit={sendMessage} className="p-5 border-t border-slate-200 bg-white z-10 flex items-center space-x-4">
                  <div className="flex-1 relative shadow-sm rounded-2xl group">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-6 pr-4 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex-shrink-0"
                  >
                    <Send className="w-5 h-5 ml-1" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-50 relative z-10">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                <div className="w-24 h-24 bg-white shadow-sm border border-slate-100 rounded-[2rem] flex items-center justify-center mb-8 rotate-3">
                  <MessageSquare className="w-10 h-10 text-emerald-600 -rotate-3" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Select a Conversation</h3>
                <p className="text-slate-500 text-base font-medium max-w-sm">Choose a contact from the sidebar to start collaborating on your next big project.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
