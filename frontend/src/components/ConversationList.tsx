import { useEffect, useState } from 'react';
import { getConversations, type Conversation } from '../api';

interface Props {
  userId: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ userId, selectedId, onSelect }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    getConversations(userId).then(setConversations).catch(console.error);
  }, [userId]);

  return (
    <div style={{ width: 220, borderRight: '1px solid #ddd', overflow: 'auto' }}>
      <div style={{ padding: '12px 16px', fontWeight: 700, fontSize: 14, color: '#666' }}>
        Conversations
      </div>
      {conversations.map((c) => (
        <div
          key={c.id}
          onClick={() => onSelect(c.id)}
          style={{
            padding: '10px 16px',
            cursor: 'pointer',
            background: c.id === selectedId ? '#e3f2fd' : 'transparent',
            fontWeight: c.id === selectedId ? 600 : 400,
          }}
        >
          {c.name}
        </div>
      ))}
      {conversations.length === 0 && (
        <div style={{ padding: '10px 16px', color: '#999' }}>No conversations</div>
      )}
    </div>
  );
}
