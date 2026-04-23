import { useEffect, useState } from "react";
import api from "../api/axios";

function Chat() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser._id || currentUser.id;

  const fetchChats = async () => {
    try {
      setError("");
      const res = await api.get("/api/messages/chats");
      const chatList = Array.isArray(res.data) ? res.data : [];
      setChats(chatList);

      const activeChatId = localStorage.getItem("activeChatId");

      if (activeChatId) {
        const foundChat = chatList.find((chat) => chat.chatId === activeChatId);
        if (foundChat) {
          setSelectedChat(foundChat);
          return;
        }
      }

      if (chatList.length > 0) {
        setSelectedChat(chatList[0]);
      } else {
        setSelectedChat(null);
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load chats.");
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const res = await api.get(`/api/messages/${chatId}`);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load messages.");
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat?.chatId) {
      localStorage.setItem("activeChatId", selectedChat.chatId);
      fetchMessages(selectedChat.chatId);
    }
  }, [selectedChat]);

  const handleSend = async (e) => {
    e.preventDefault();

    if (!text.trim() || !selectedChat?.chatId || !selectedChat?.otherUser?._id) {
      return;
    }

    try {
      await api.post("/api/messages", {
        chatId: selectedChat.chatId,
        receiver: selectedChat.otherUser._id,
        text: text.trim(),
        itemId: selectedChat.itemId || null,
      });

      setText("");
      await fetchMessages(selectedChat.chatId);
      await fetchChats();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to send message.");
    }
  };

  return (
    <main className="page-shell">
      <section
        className="content-panel"
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: "20px",
        }}
      >
        <aside className="report-card">
          <h2 style={{ marginBottom: "14px" }}>Chats</h2>

          {chats.length === 0 ? (
            <p>No conversations yet.</p>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.chatId}
                onClick={() => setSelectedChat(chat)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  marginBottom: "10px",
                  padding: "12px",
                  borderRadius: "10px",
                  border:
                    selectedChat?.chatId === chat.chatId
                      ? "2px solid #2563eb"
                      : "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                <strong>{chat.otherUser?.name || "User"}</strong>
                <p style={{ margin: "6px 0 0" }}>{chat.lastMessage || "No messages yet"}</p>
              </button>
            ))
          )}
        </aside>

        <section className="report-card">
          {!selectedChat ? (
            <div className="empty-state">
              <h3>Select a chat</h3>
              <p>Choose a conversation to view messages.</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "18px" }}>
                <h2>{selectedChat.otherUser?.name || "User"}</h2>
                <p>Item-related conversation</p>
              </div>

              <div style={{ minHeight: "300px", marginBottom: "20px" }}>
                {messages.length === 0 ? (
                  <p>No messages yet. Start the conversation.</p>
                ) : (
                  messages.map((message) => {
                    const senderId =
                      message.sender?._id || message.sender?.id || message.sender;
                    const isMine = String(senderId) === String(currentUserId);

                    return (
                      <div
                        key={message._id}
                        style={{
                          display: "flex",
                          justifyContent: isMine ? "flex-end" : "flex-start",
                          marginBottom: "12px",
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "70%",
                            padding: "10px 14px",
                            borderRadius: "12px",
                            background: isMine ? "#2563eb" : "#f1f5f9",
                            color: isMine ? "#fff" : "#111",
                          }}
                        >
                          {message.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleSend} style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "10px",
                    border: "1px solid #ccc",
                  }}
                />
                <button className="primary-btn" type="submit">
                  Send
                </button>
              </form>
            </>
          )}
        </section>
      </section>

      {error && <p className="error-banner">{error}</p>}
    </main>
  );
}

export default Chat;
