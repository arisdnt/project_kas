import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/core/lib/utils';

interface ProfileAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  editable?: boolean;
  onChangeFile?: (file: File) => void;
  loading?: boolean;
}

const sizeMap = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-16 w-16 text-base',
  lg: 'h-24 w-24 text-xl',
  xl: 'h-32 w-32 text-2xl'
};

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  src,
  name,
  size = 'lg',
  className,
  editable,
  onChangeFile,
  loading
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const initials = React.useMemo(() => {
    if (!name) return '?';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [name]);

  const handleClick = () => {
    if (editable && inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    onChangeFile?.(e.target.files[0]);
  };

  return (
    <div className="relative inline-block">
      <AvatarPrimitive.Root
        onClick={handleClick}
        className={cn(
          'group relative flex select-none items-center justify-center overflow-hidden rounded-full border border-border bg-muted ring-offset-background transition hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          sizeMap[size],
          editable && 'cursor-pointer',
          className
        )}
      >
        {src ? (
          <AvatarPrimitive.Image
            src={src}
            className="h-full w-full object-cover"
            alt={name || 'avatar'}
          />
        ) : (
          <AvatarPrimitive.Fallback
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-medium"
            delayMs={0}
          >
            {initials}
          </AvatarPrimitive.Fallback>
        )}
        {editable && (
          <div className="absolute inset-0 hidden items-center justify-center bg-black/40 text-[11px] font-medium text-white backdrop-blur-sm group-hover:flex">
            {loading ? 'Mengunggah...' : 'Ganti'}
          </div>
        )}
      </AvatarPrimitive.Root>
      {editable && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      )}
    </div>
  );
};
