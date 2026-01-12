import { useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  TOAST_DURATION,
  TOAST_POSITION,
  TOAST_STYLES,
} from '../constants';

/**
 * Custom hook za toast notifikacije
 * Zamjena za window.alert() i window.confirm()
 */
export function useToast() {
  return useMemo(() => {
    const showSuccess = (message: string) => {
      toast.success(message, {
        duration: TOAST_DURATION.SUCCESS,
        position: TOAST_POSITION,
        style: {
          background: TOAST_STYLES.BACKGROUND,
          color: TOAST_STYLES.TEXT_COLOR,
          border: `1px solid ${TOAST_STYLES.SUCCESS_BORDER}`,
        },
      });
    };

    const showError = (message: string) => {
      toast.error(message, {
        duration: TOAST_DURATION.ERROR,
        position: TOAST_POSITION,
        style: {
          background: TOAST_STYLES.BACKGROUND,
          color: TOAST_STYLES.TEXT_COLOR,
          border: `1px solid ${TOAST_STYLES.ERROR_BORDER}`,
        },
      });
    };

    const showInfo = (message: string) => {
      toast(message, {
        duration: TOAST_DURATION.INFO,
        position: TOAST_POSITION,
        icon: 'ℹ️',
        style: {
          background: TOAST_STYLES.BACKGROUND,
          color: TOAST_STYLES.TEXT_COLOR,
          border: `1px solid ${TOAST_STYLES.INFO_BORDER}`,
        },
      });
    };

    const showLoading = (message: string) => {
      return toast.loading(message, {
        position: TOAST_POSITION,
        style: {
          background: TOAST_STYLES.BACKGROUND,
          color: TOAST_STYLES.TEXT_COLOR,
          border: `1px solid ${TOAST_STYLES.LOADING_BORDER}`,
        },
      });
    };

    const dismissToast = (toastId: string) => {
      toast.dismiss(toastId);
    };

    /**
     * Promisifikovana verzija confirm dijaloga
     * Privremeno koristi window.confirm dok se ne implementira custom modal
     * @param message Poruka za potvrdu
     * @returns Promise<boolean> - true ako korisnik potvrdi, false ako odustane
     */
    const confirm = (message: string): Promise<boolean> => {
      return Promise.resolve(window.confirm(message));
    };

    return {
      showSuccess,
      showError,
      showInfo,
      showLoading,
      dismissToast,
      confirm,
    };
  }, []); // Prazan dependency array - funkcije su stabilne
}
