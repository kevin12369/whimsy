export interface ToastProps {
  message: string | null;
  variant?: 'info' | 'warning' | 'error';
}

export function Toast({ message, variant = 'info' }: ToastProps) {
  if (!message) return null;
  const colors = {
    info: 'bg-zinc-800 text-zinc-100',
    warning: 'bg-amber-700 text-amber-50',
    error: 'bg-red-800 text-red-50',
  } as const;
  return (
    <div className={`fixed bottom-4 right-4 px-3 py-2 rounded shadow ${colors[variant]}`}>
      {message}
    </div>
  );
}
