import { Input } from '@/components/ui/Input';
import { EyeIcon, EyeOffIcon } from '@/components/ui/icons';

export function PasswordField({ id, name, autoComplete, placeholder, required = true, visible, onToggle, className = 'pr-10 bg-background' }: {
  id: string; name: string; autoComplete?: string; placeholder?: string;
  required?: boolean; visible: boolean; onToggle: () => void; className?: string;
}) {
  return (
    <div className="relative">
      <Input id={id} name={name} type={visible ? 'text' : 'password'} required={required} autoComplete={autoComplete} placeholder={placeholder} className={className} />
      <button type="button" onClick={onToggle} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-ring">
        {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
      </button>
    </div>
  );
}
