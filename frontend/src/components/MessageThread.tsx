import { useEffect, useState, useRef } from 'react';
import {
  getMessages,
  sendMessage,
  searchMessages,
  type Message,
} from '../api';

interface Props {
  userId: string;
  conversationId: string;
}

export function MessageThread({ userId, conversationId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [newBody, setNewBody] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[] | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    const data = await getMessages(userId, conversationId);
    setMessages(data.messages.reverse());
    setNextCursor(data.nextCursor);
    setSearchResults(null);
    setSearchQuery('');
  };

  useEffect(() => {
    loadMessages().catch(console.error);
  }, [userId, conversationId]);

  const handleSend = async () => {
    if (!newBody.trim() || sending) return;
    setSending(true);
    await sendMessage(userId, conversationId, newBody.trim());
    setNewBody('');
    setSending(false);
    await loadMessages();
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const results = await searchMessages(userId, conversationId, searchQuery);
    setSearchResults(results);
  };

  const displayMessages = searchResults ?? messages;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Search bar */}
      <div style={{ padding: '8px 16px', borderBottom: '1px solid #eee', display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ flex: 1, padding: '6px 10px', fontSize: 14, border: '1px solid #ddd', borderRadius: 4 }}
        />
        <button onClick={handleSearch} style={{ padding: '6px 16px', fontSize: 14 }}>
          Search
        </button>
        {searchResults && (
          <button
            onClick={() => { setSearchResults(null); setSearchQuery(''); }}
            style={{ padding: '6px 12px', fontSize: 14 }}
          >
            Clear
          </button>
        )}
      </div>

      {searchResults && (
        <div style={{ padding: '4px 16px', fontSize: 12, color: '#666', background: '#fff9e6' }}>
          {searchResults.length} search result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {nextCursor && !searchResults && (
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <button
              onClick={async () => {
                const data = await getMessages(userId, conversationId, 50, nextCursor);
                setMessages((prev) => [...data.messages.reverse(), ...prev]);
                setNextCursor(data.nextCursor);
              }}
              style={{ padding: '4px 12px', fontSize: 12, color: '#666' }}
            >
              Load older messages
            </button>
          </div>
        )}

        {displayMessages.map((m) => (
          <div key={m.id} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#888' }}>
              <strong style={{ color: '#333' }}>{m.senderId}</strong>
              {' '}
              {new Date(m.timestamp).toLocaleTimeString()}
            </div>
            <div style={{ fontSize: 14, marginTop: 2 }}>{m.body}</div>
          </div>
        ))}

        {displayMessages.length === 0 && (
          <div style={{ color: '#999', textAlign: 'center', marginTop: 40 }}>
            {searchResults ? 'No results found' : 'No messages yet. Send one!'}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Send message */}
      {!searchResults && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid #eee', display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Type a message..."
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{ flex: 1, padding: '8px 12px', fontSize: 14, border: '1px solid #ddd', borderRadius: 4 }}
          />
          <button
            onClick={handleSend}
            disabled={sending || !newBody.trim()}
            style={{ padding: '8px 20px', fontSize: 14 }}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
