const USERS = [
  { id: 'user-alice', label: 'Alice (tenant-alpha)' },
  { id: 'user-bob', label: 'Bob (tenant-alpha)' },
  { id: 'user-charlie', label: 'Charlie (tenant-beta)' },
];

interface Props {
  currentUser: string;
  onSelect: (userId: string) => void;
}

export function UserPicker({ currentUser, onSelect }: Props) {
  return (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid #ddd', background: '#f8f9fa' }}>
      <label style={{ fontWeight: 600, marginRight: 8 }}>User:</label>
      <select
        value={currentUser}
        onChange={(e) => onSelect(e.target.value)}
        style={{ padding: '4px 8px', fontSize: 14 }}
      >
        {USERS.map((u) => (
          <option key={u.id} value={u.id}>
            {u.label}
          </option>
        ))}
      </select>
    </div>
  );
}
