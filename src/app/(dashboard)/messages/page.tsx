"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type User = {
  id: string;
  name: string;
  avatarUrl: string | null;
  college: string;
};

type Connection = {
  id: string;
  status: string;
  sender: User;
  receiver: User;
};

type Message = {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
};

function MessagesContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const selectedUserId = searchParams.get("userId");

  const [connections, setConnections] = useState<Connection[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch connections for the sidebar
  useEffect(() => {
    async function fetchConnections() {
      try {
        const res = await fetch("/api/connections");
        if (res.ok) {
          const data = await res.json();
          // Filter to only ACCEPTED connections
          setConnections(data.filter((c: Connection) => c.status === "ACCEPTED"));
        }
      } catch (err) {
        console.error("Failed to fetch connections", err);
      }
    }
    fetchConnections();
  }, []);

  // Fetch messages when selected user changes
  useEffect(() => {
    if (!selectedUserId) return;

    let intervalId: NodeJS.Timeout;

    async function fetchMessages() {
      try {
        const res = await fetch(`/api/messages?userId=${selectedUserId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
          
          // Mark messages as read
          await fetch("/api/messages/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senderId: selectedUserId }),
          });
        }
      } catch (err) {
        console.error("Failed to fetch messages", err);
      } finally {
        setLoadingChats(false);
      }
    }

    fetchMessages();
    
    // Poll for new messages every 3 seconds
    intervalId = setInterval(fetchMessages, 3000);

    return () => clearInterval(intervalId);
  }, [selectedUserId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;

    const content = newMessage;
    setNewMessage(""); // Optimistic clear

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: selectedUserId, content }),
      });

      if (res.ok) {
        const message = await res.json();
        setMessages((prev) => [...prev, message]);
      }
    } catch (err) {
      console.error("Failed to send message", err);
    }
  }

  // Get active connection details
  const activeConnection = connections.find(c => 
    c.sender.id === selectedUserId || c.receiver.id === selectedUserId
  );
  const activeFriend = activeConnection 
    ? (activeConnection.sender.id === session?.user?.id ? activeConnection.receiver : activeConnection.sender)
    : null;

  return (
    <div className="messages-layout animate-fade-in">
      
      {/* ── Sidebar ── */}
      <aside className="messages-sidebar glass">
        <div className="sidebar-header">
          <h2>Messages</h2>
        </div>
        <div className="sidebar-list">
          {connections.length === 0 ? (
            <div className="no-chats">
              <span style={{ fontSize: 32 }}>🤝</span>
              <p>Connect with students to start chatting.</p>
              <Link href="/directory" className="btn-secondary" style={{ marginTop: 12 }}>
                Find Students
              </Link>
            </div>
          ) : (
            connections.map(conn => {
              const friend = conn.sender.id === session?.user?.id ? conn.receiver : conn.sender;
              const isActive = friend.id === selectedUserId;
              
              return (
                <Link 
                  key={conn.id} 
                  href={`/messages?userId=${friend.id}`}
                  className={`chat-contact ${isActive ? 'active' : ''}`}
                >
                  <div className="contact-avatar">
                    {friend.avatarUrl ? (
                      <Image src={friend.avatarUrl} alt={friend.name} fill style={{ objectFit: "cover" }} />
                    ) : (
                      <span className="contact-initial">{friend.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="contact-info">
                    <span className="contact-name">{friend.name}</span>
                    <span className="contact-college">{friend.college}</span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </aside>

      {/* ── Main Chat Area ── */}
      <main className="messages-main glass">
        {!selectedUserId ? (
          <div className="empty-chat-state">
            <span style={{ fontSize: 64 }}>💬</span>
            <h2>Select a conversation</h2>
            <p>Choose a connection from the sidebar to start messaging.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              {activeFriend && (
                <>
                  <div className="chat-header-user">
                    <div className="header-avatar">
                      {activeFriend.avatarUrl ? (
                        <Image src={activeFriend.avatarUrl} alt={activeFriend.name} fill style={{ objectFit: "cover" }} />
                      ) : (
                        <span className="header-initial">{activeFriend.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="header-name">{activeFriend.name}</h3>
                      <span className="header-college">{activeFriend.college}</span>
                    </div>
                  </div>
                  <Link href={`/profile/${activeFriend.id}`} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                    View Profile
                  </Link>
                </>
              )}
            </div>

            {/* Chat History */}
            <div className="chat-history">
              {loadingChats ? (
                <div className="chat-loading">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="chat-empty">
                  Say hi to {activeFriend?.name.split(" ")[0] || "your connection"}! 👋
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMine = msg.senderId === session?.user?.id;
                  
                  // Simple time formatter
                  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div key={msg.id} className={`message-wrapper ${isMine ? 'mine' : 'theirs'}`}>
                      <div className="message-bubble">
                        {msg.content}
                        <span className="message-time">{time}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="chat-input"
              />
              <button 
                type="submit" 
                className="btn-primary send-btn"
                disabled={!newMessage.trim()}
              >
                Send
              </button>
            </form>
          </>
        )}
      </main>

      <style>{`
        .messages-layout {
          display: flex;
          height: calc(100vh - 80px - var(--space-8));
          gap: var(--space-6);
          margin-top: var(--space-4);
        }

        /* ── Sidebar ── */
        .messages-sidebar {
          width: 320px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-xl);
          overflow: hidden;
        }
        .sidebar-header {
          padding: var(--space-5);
          border-bottom: 1px solid var(--color-border);
        }
        .sidebar-header h2 {
          font-size: 1.2rem;
          font-weight: 700;
        }
        .sidebar-list {
          flex: 1;
          overflow-y: auto;
        }
        .no-chats {
          padding: var(--space-8) var(--space-5);
          text-align: center;
          color: var(--color-text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
        }
        
        .chat-contact {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4) var(--space-5);
          border-bottom: 1px solid var(--color-border);
          text-decoration: none;
          transition: background 0.2s ease;
        }
        .chat-contact:hover {
          background: var(--color-bg-card-hover);
        }
        .chat-contact.active {
          background: var(--color-accent-glow);
          border-left: 4px solid var(--color-accent);
        }

        .contact-avatar, .header-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--color-accent);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }
        .contact-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .contact-name {
          color: var(--color-text-primary);
          font-weight: 600;
          font-size: 0.95rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .contact-college {
          color: var(--color-text-secondary);
          font-size: 0.8rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── Main Chat Area ── */
        .messages-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-xl);
          overflow: hidden;
        }
        .empty-chat-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--space-3);
          color: var(--color-text-secondary);
        }
        .empty-chat-state h2 {
          color: var(--color-text-primary);
          font-size: 1.4rem;
        }

        .chat-header {
          padding: var(--space-4) var(--space-5);
          border-bottom: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--color-bg-card);
        }
        .chat-header-user {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .header-name {
          font-weight: 700;
          font-size: 1.1rem;
        }
        .header-college {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
        }

        .chat-history {
          flex: 1;
          padding: var(--space-5);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          background: var(--color-bg-primary);
        }
        .chat-loading, .chat-empty {
          text-align: center;
          padding: var(--space-8);
          color: var(--color-text-secondary);
        }

        .message-wrapper {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .message-wrapper.mine {
          align-items: flex-end;
        }
        .message-wrapper.theirs {
          align-items: flex-start;
        }

        .message-bubble {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 0.95rem;
          line-height: 1.4;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .mine .message-bubble {
          background: var(--color-accent);
          color: white;
          border-bottom-right-radius: 4px;
        }
        .theirs .message-bubble {
          background: var(--color-bg-card-hover);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border);
          border-bottom-left-radius: 4px;
        }
        
        .message-time {
          font-size: 0.7rem;
          align-self: flex-end;
          opacity: 0.7;
        }

        .chat-input-area {
          padding: var(--space-4) var(--space-5);
          border-top: 1px solid var(--color-border);
          display: flex;
          gap: var(--space-3);
          background: var(--color-bg-card);
        }
        .chat-input {
          flex: 1;
          padding: 14px 20px;
          border-radius: 24px;
          border: 1px solid var(--color-border);
          background: var(--color-bg-primary);
          color: var(--color-text-primary);
          font-size: 0.95rem;
        }
        .chat-input:focus {
          outline: none;
          border-color: var(--color-accent);
        }
        .send-btn {
          padding: 0 24px;
          border-radius: 24px;
        }
      `}</style>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
