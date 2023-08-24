import { createContext, useCallback, useEffect, useState } from "react";
import { baseUrl, getRequest, postRequest } from "../utils/services";
import { io } from "socket.io-client";
import PropTypes from 'prop-types';

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user}) => {
    const [userChats, setUserChats] = useState(null);
    const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
    const [userChatsError, setUserChatsErrors] = useState(null);
    const [potentialChats, setPotentialChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState(null);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [messagesError, setMessagesErrors] = useState(null);
    const [sendTextMessageError, setSendTextMessageError] = useState(null);
    const [newMessage, setNewMessage] = useState(null);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    console.log("onlineUsers", onlineUsers);

    useEffect(() => {
        const newSocket = io("http://localhost:3000");
        setSocket(newSocket);

        return () => {
            newSocket.disconnect()
        }
    }, [user]);

    useEffect(() => {
        if(socket === null) return;
        socket.emit("addNewUser", user?._id);
        socket.on("getOnlineUsers", (res) => {
            setOnlineUsers(res);
        });

        return () => {
            socket.off("getOnlineUsers");
        };
    }, [socket, user?._id]);

    useEffect(() => {
        if(socket === null) return;

        const recipientId = currentChat?.members.find((id) => id !== user?._id);

        socket.emit("sendMessage", {...newMessage, recipientId});
       
    }, [newMessage, currentChat?.members, socket, user?._id]);

    useEffect(() => {
        if(socket === null) return;

        socket.on("getMessage", res => {
            if(currentChat?._id !== res.chatId)return

            setMessages((prev) => [...prev, res]);
        });

        return () => {
            socket.off("getMessage")
        }
       
    }, [socket, currentChat]);



    useEffect(() => {
        const getUsers = async() => {
            const response = await getRequest(`${baseUrl}/users`);

            if(response.error){
                return console.log("Error fetching users", response)
            }

            const pChats = response.filter((u) => {
                let isChatCreated = false;
                if(user?._id === u._id)return false; 
                if(userChats){
                    isChatCreated = userChats?.some((chat) => {
                        return chat.members[0] === u._id || chat.members[1] === u._id;
                    })
                }

                return !isChatCreated;
            });

            setPotentialChats(pChats);
        };
        getUsers();
    }, [userChats, user?._id]);

    useEffect (() => {
        const getUserChats = async()=> {
            if(user?._id){
                setIsUserChatsLoading(true);
                setUserChatsErrors(null);

                const response = await getRequest(`${baseUrl}/chats/${user?._id}`);

                setIsUserChatsLoading(false);

                if(response.error){
                    return setUserChatsErrors(response);
                }
                setUserChats(response);
            }
        };
        getUserChats();
    }, [user]);
    
    useEffect (() => {
        const getMessages = async()=> {
      
                setIsMessagesLoading(true);
                setMessagesErrors(null);

                const response = await getRequest(`${baseUrl}/messages/${currentChat?._id}`);

                setIsMessagesLoading(false);

                if(response.error){
                    return setMessagesErrors(response);
                }
                setMessages(response);

        };
        getMessages();
    }, [currentChat]);

    const sendTextMessage = useCallback(async (textMessage, sender, currentChatId, setTextMessage) => {
        if(!textMessage){
            return console.log("You must type something...")
        }

        const response = await postRequest(
            `${baseUrl}/messages`, 
            JSON.stringify({
                chatId: currentChat,
                senderId: sender._id,
                text: textMessage
            })
        );
        if(response.error){
            return setSendTextMessageError(response);
        }
        setNewMessage(response)
        setMessages((prev)=> [...prev, response])
        setTextMessage("");
        setSendTextMessageError(null);
    }, [currentChat]);

    const updateCurrentChat = useCallback((chat) => {
        setCurrentChat(chat);
    }, []);

    const createChat = useCallback(async (firstId, secondId) => {
            const response = await postRequest(`${baseUrl}/chats`, JSON.stringify({
                firstId, secondId,
            })  
        );
        if(response.error){
            return console.log("Error creating chat", response);
        }

        setUserChats((prev) => [...prev, response]);
    }, []);

    return (
        <ChatContext.Provider value = {{
            userChats,
            isUserChatsLoading,
            userChatsError,
            potentialChats,
            createChat,
            updateCurrentChat,
            messages,
            isMessagesLoading,
            messagesError,
            sendTextMessage,
            sendTextMessageError,
        }}>
            {children}
        </ChatContext.Provider>
    )
};

ChatContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
    user: PropTypes.object.isRequired,
};

