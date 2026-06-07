import React, { createContext, useContext, useState, useCallback } from 'react';
import { CONVERSATIONS } from '../data/headerMockData';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [convos] = useState(CONVERSATIONS);
  const [chatPopOpen, setChatPopOpen] = useState(false);
  const [openChats, setOpenChats] = useState([]);
  const [chatSearch, setChatSearch] = useState('');

  const totalUnread = convos.reduce((s, c) => s + c.unread, 0);

  const openChatWith = useCallback((conv) => {
    setOpenChats((prev) => {
      if (prev.find((c) => c.id === conv.id)) return prev;
      return [...prev, conv];
    });
    setChatPopOpen(false);
  }, []);

  const closeChat = useCallback((conv) => {
    setOpenChats((prev) => prev.filter((c) => c.id !== conv.id));
  }, []);

  const filteredConvs = chatSearch
    ? convos.filter((c) => c.name.toLowerCase().includes(chatSearch.toLowerCase()))
    : convos;

  return (
    <ChatContext.Provider
      value={{
        convos,
        openChats,
        totalUnread,
        chatPopOpen,
        chatSearch,
        setChatSearch,
        filteredConvs,
        openChatWith,
        closeChat,
        setChatPopOpen,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
