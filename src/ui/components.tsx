import type { ReactNode } from 'react';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <div className="label">{label}</div>
      {children}
    </label>
  );
}

export function Rating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="seg">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={n <= value ? 'on' : ''}>{n}</button>
      ))}
    </div>
  );
}

export function PrimaryButton(
  { children, onClick, type = 'button', disabled = false }:
  { children: ReactNode; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean },
) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className="btn-primary">
      {children}
    </button>
  );
}
