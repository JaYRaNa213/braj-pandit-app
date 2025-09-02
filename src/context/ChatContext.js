import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useSelector((state) => state.user);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [birthdate, setBirthdate] = useState(new Date());
  const [birthtime, setBirthtime] = useState(new Date());
  const [birthPlace, setBirthPlace] = useState('');
  const [newMessage, setNewMessage] = useState(null);
  const [checkEligibilityLoading, setCheckEligibilityLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [refetch, setRefetch] = useState(false);
  const [newMessageRecievedSupport, setNewMessageRecievedSupport] =
    useState(null);
  const [incomingWaitlistedRequest, setIncomingWaitlistedRequest] =
    useState(null);
  const [isFullScreenRequest, setIsFullScreenRequest] = useState(false);

  const [isTopAstrologerModalOpen, setIsTopAstrologerModalOpen] =
    useState(false);

  const [topAstrologersConfig, setTopAstrologersConfig] = useState({
    astroName: '',
    requestType: 'chat',
  });
  const [isJoinWaitlistModalOpen, setIsJoinWaitlistModalOpen] = useState(false);
  const [waitListJoinedModalOpen, setWaitListJoinedModalOpen] = useState(false);

  const [waitListProps, setWaitListProps] = useState({
    astrologer: null,
    action: null,
  }); // waitListProps
  const openTopAstrologerModal = () => setIsTopAstrologerModalOpen(true);
  const closeTopAstrologerModal = () => setIsTopAstrologerModalOpen(false);

  const openJoinWaitlistModal = () => setIsJoinWaitlistModalOpen(true);
  const closeJoinWaitlistModal = () => setIsJoinWaitlistModalOpen(false);

  const openWaitListJoinedModal = () => setWaitListJoinedModalOpen(true);
  const closeWaitListJoinedModal = () => setWaitListJoinedModalOpen(false);

  const [newAiMessage, setNewAiMessage] = useState(null);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiChatSessionId, setAiChatSessionId] = useState(null);
  const [isLoadingAiMessage, setIsLoadingAiMessage] = useState(false);

  const [selectedAiAstro, setSelectedAiAstro] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user?.name || '');
      setGender(user?.gender || '');
      setBirthdate(user?.DOB || '');
      setBirthtime(user?.TOB || '');
      setBirthPlace(user?.POB || '');
    }
  }, [user]);

  return (
    <ChatContext.Provider
      value={{
        name,
        gender,
        birthdate,
        birthPlace,
        birthtime,
        setName,
        setGender,
        setBirthPlace,
        setBirthtime,
        setBirthdate,
        refetch,
        setRefetch,
        newMessageRecievedSupport,
        setNewMessageRecievedSupport,
        newMessage,
        setNewMessage,
        checkEligibilityLoading,
        setCheckEligibilityLoading,
        pendingRequests,
        setPendingRequests,
        activeChat,
        setActiveChat,
        openTopAstrologerModal,
        closeTopAstrologerModal,
        isTopAstrologerModalOpen,
        topAstrologersConfig,
        setTopAstrologersConfig,
        isJoinWaitlistModalOpen,
        openJoinWaitlistModal,
        closeJoinWaitlistModal,
        waitListProps,
        setWaitListProps,
        openWaitListJoinedModal,
        closeWaitListJoinedModal,
        waitListJoinedModalOpen,
        incomingWaitlistedRequest,
        setIncomingWaitlistedRequest,
        isFullScreenRequest,
        setIsFullScreenRequest,
        newAiMessage,
        setNewAiMessage,
        aiChatSessionId,
        setAiChatSessionId,
        aiMessages,
        setAiMessages,
        isLoadingAiMessage,
        setIsLoadingAiMessage,
        selectedAiAstro,
        setSelectedAiAstro,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
