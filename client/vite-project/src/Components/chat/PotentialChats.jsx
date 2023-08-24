import { useContext } from "react";
import { ChatContext } from "../../context/chatContext";
import { AuthContext } from "../../context/AuthContext";

const PotentialChats = () => {

    const {user} = useContext(AuthContext);

    const {potentailChats, createChat, onlineUsers} = useContext(ChatContext);

    return <>
        <div className="all-users" >
            {potentailChats && potentailChats.map((u, index) => {
                return(
                    <div className="single-use" key = {index} onClick={() => createChat(user._id, u._id)}>
                        {u.name}
                        <span 
                            className={onlineUsers?.some((user) => user?.userId === u?._id) ? "user-online" : ""}>
                        </span>
                    </div>
                );
            })}
        </div>
    </>;
}
 
export default PotentialChats;