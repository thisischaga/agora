import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../Utils/api";
import Chat from "../components/Chat";

const ChatPage = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const token        = useMemo(() => localStorage.getItem("token"), []);
  const [receiver, setReceiver] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/user/${id}`, {
          headers: { Authorization: `Bearer${token}` },
        });
        setReceiver({
          _id:          id,
          username:     data.username,
          userPP:       data.userPP,
          socketId:     data.socketId,
          locationName: data.locationName,
          distance:     data.distance,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token]);

  if (loading) return null;
  if (!receiver) return null;

  return (
    <Chat
      receiver={receiver}
      onClose={() => navigate(-1)}
    />
  );
};

export default ChatPage;