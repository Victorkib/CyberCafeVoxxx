import { useState, useCallback } from 'react';

export const useConfirmation = () => {
  const [confirmationState, setConfirmationState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'warning',
    onConfirm: null,
    details: null,
    icon: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const showConfirmation = useCallback((options) => {
    setConfirmationState({
      isOpen: true,
      title: options.title || 'Confirm Action',
      message: options.message || 'Are you sure you want to proceed?',
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      type: options.type || 'warning',
      onConfirm: options.onConfirm,
      details: options.details,
      icon: options.icon,
    });
  }, []);

  const hideConfirmation = useCallback(() => {
    if (!isLoading) {
      setConfirmationState((prev) => ({ ...prev, isOpen: false }));
    }
  }, [isLoading]);

  const handleConfirm = useCallback(async () => {
    if (confirmationState.onConfirm) {
      setIsLoading(true);
      try {
        await confirmationState.onConfirm();
        hideConfirmation();
      } catch (error) {
        console.error('Confirmation action failed:', error);
        // Don't hide the modal on error, let the parent handle it
      } finally {
        setIsLoading(false);
      }
    } else {
      hideConfirmation();
    }
  }, [confirmationState.onConfirm, hideConfirmation]);

  return {
    confirmationState,
    isLoading,
    showConfirmation,
    hideConfirmation,
    handleConfirm,
  };
};
