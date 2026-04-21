import { useState } from 'react';
import { UserPicker } from './components/UserPicker';
import { ConversationList } from './components/ConversationList';
import { MessageThread } from './components/MessageThread';

function App() {
  const [userId, setUserId] = useState('user-alice');
  const [conversationId, setConversationId] = useState<string | null>(null);

  const handleUserChange = (newUserId: string) => {
    setUserId(newUserId);
    setConversationId(null);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
      <UserPicker currentUser={userId} onSelect={handleUserChange} />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <ConversationList
          userId={userId}
          selectedId={conversationId}
          onSelect={setConversationId}
        />
        <div style={{ flex: 1, display: 'flex' }}>
          {conversationId ? (
            <MessageThread userId={userId} conversationId={conversationId} />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
              Select a conversation to start
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
