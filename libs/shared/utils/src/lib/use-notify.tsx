import {
  cleanNotifications,
  showNotification,
  updateNotification,
} from '@mantine/notifications';
import { BsCheckCircle, BsExclamationCircle } from 'react-icons/bs';

// eslint-disable-next-line unicorn/prefer-node-protocol
import crypto from 'crypto';

import { texts } from '@lihim/shared/core';

const options = {
  success: {
    color: 'green',
    icon: <BsCheckCircle />,
    autoClose: 4000,
  },
  error: {
    color: 'red',
    icon: <BsExclamationCircle />,
    autoClose: 9000,
  },
};

export const useNotify = () => {
  const id = crypto.randomUUID();

  // Loading notification
  const notifyLoading = (message: string) => {
    cleanNotifications();
    showNotification({
      id,
      color: 'blue',
      title: texts.loading,
      message,
      loading: true,
      autoClose: false,
      disallowClose: true,
    });
  };

  const notify = (title: string, message: string, isSuccess = true) => {
    updateNotification({
      id,
      title,
      message,
      ...(isSuccess ? options.success : options.error),
    });
  };

  // Success notification
  const notifySuccess = (title: string, message: string) => {
    notify(title, message);
  };

  // Error notification
  const notifyError = (title: string, message: string) => {
    notify(title, message, false);
  };

  return {
    id,
    notifyLoading,
    notifySuccess,
    notifyError,
  };
};
