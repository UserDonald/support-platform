import { cn } from '@workspace/ui/lib/utils';
import { ReactNode } from 'react';

export const WidgetHeader = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <header
      className={cn(
        'bg-gradient-to-b from-primary to-[#0b63f3] p-4 text-primary-foreground',
        className
      )}
    >
      {children}
    </header>
  );
};
