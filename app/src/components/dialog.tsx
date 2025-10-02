/* eslint-disable react-refresh/only-export-components */
import type React from 'react';
import { useState } from 'react';

export interface DialogController<T = unknown> {
  visible: boolean;
  data?: T;
  onOpen: (data?: T) => void;
  onClose: () => void;
}

export interface DialogProps<T = unknown> {
  controller: DialogController<T>;
  children?: React.ReactNode;
  title?: string;
  className?: string;
}

export const useDialogController = <T = unknown,>(): DialogController<T> => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<T | undefined>(undefined);

  const onOpen = (newData?: T) => {
    setData(newData);
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
    setData(undefined);
  };

  return {
    visible,
    data,
    onOpen,
    onClose,
  };
};

export default function Dialog<T = unknown>({
  controller,
  children,
  title,
  className = '',
}: DialogProps<T>) {
  if (!controller.visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={controller.onClose} />

      {/* Dialog */}
      <div
        className={`relative bg-background border border-muted rounded-lg shadow-lg max-w-md w-full mx-4 ${className}`}
      >
        {title && (
          <div className="px-6 py-4 border-b border-muted">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          </div>
        )}

        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}
