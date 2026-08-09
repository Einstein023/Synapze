import React from 'react';

interface ToastNotificationProps {
  title?: string;
  body?: string;
  onClose?: () => void;
  duration?: number;
}

export const ToastNotification: React.FC<ToastNotificationProps> = () => {
  return null;
};

