import { useContext } from "react";
import { ChatContext } from "../context/chatContext";
import { Container, Stack } from "react-bootstrap";
import UserChat from "../Components/chat/UserChat"
import { AuthContext } from "../context/AuthContext";
import PotentialChats from "../Components/chat/PotentialChats";
import ChatBox from "../Components/chat/ChatBox";

const Chat = () => {
    const {user} = useContext(AuthContext);
    const {userChats,
        isUserChatsLoading, 
        updateCurrentChat} = useContext(ChatContext);

    return ( <Container>
        <PotentialChats/>
        {userChats?.length< 1 ? null :(
            <Stack direction="horizontal" gap={4} className="align-items-start">
                <Stack className="messages-box flex-frow-0 pe-3" gap={3} >
                    {isUserChatsLoading && <p> Loading chats... </p>}
                    {userChats?.map((Chat, index) => {
                        return (
                            <div key = {index} onClick={() => updateCurrentChat(Chat)}>
                                <UserChat chat = {Chat} user = {user} />
                            </div>
                        )
                    })}
                </Stack>
                <ChatBox/>
            </Stack>
        )}
    </Container>);
}
 
export default Chat;