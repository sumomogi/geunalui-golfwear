import type { ReactNode } from 'react';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{label}</div>
      {children}
    </label>
  );
}

export function Rating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          style={{
            width: 36, height: 36, borderRadius: 8,
            border: '1px solid #ccc',
            background: n <= value ? '#2f7d4f' : '#fff',
            color: n <= value ? '#fff' : '#333',
          }}>{n}</button>
      ))}
    </div>
  );
}

export function PrimaryButton(
  { children, onClick, type = 'button', disabled = false }:
  { children: ReactNode; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean },
) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{
        width: '100%', padding: '14px', borderRadius: 12, border: 'none',
        background: '#2f7d4f', color: '#fff', fontSize: 16, fontWeight: 600,
        opacity: disabled ? 0.6 : 1,
      }}>{children}</button>
  );
}
