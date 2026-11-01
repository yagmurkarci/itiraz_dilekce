import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const NotificationContext = createContext(null);

const ICONS = { success: '✓', error: '!', info: 'i' };

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const hideNotification = useCallback(() => setNotification(null), []);
  const showNotification = useCallback((type, title, message) => {
    setNotification({ type, title, message: message || '' });
  }, []);

  useEffect(() => {
    if (!notification) return undefined;
    const handleKey = (event) => {
      if (event.key === 'Escape') hideNotification();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [notification, hideNotification]);

  const value = useMemo(
    () => ({ showNotification, hideNotification }),
    [showNotification, hideNotification]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notification && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={hideNotification}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className={`modal-icon ${notification.type}`}>{ICONS[notification.type] || 'i'}</div>
            <h3 className="modal-title">{notification.title}</h3>
            <p className="modal-message">{notification.message}</p>
            <div className="modal-actions">
              <button className="primary-button" type="button" onClick={hideNotification}>
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
