
import React, { useState, useEffect } from 'react';
import { BellIcon } from './Icons';

export const NotificationPermissionRequest = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show if the browser supports notifications and we haven't asked yet (state is 'default')
    if ('Notification' in window && Notification.permission === 'default') {
      setIsVisible(true);
    }
  }, []);

  const handleEnable = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Send a test notification immediately to confirm it works
        try {
          new Notification('FocusFlow', {
            body: 'Notifications enabled! You will be notified when timers complete.',
            icon: 'https://cdn-icons-png.flaticon.com/512/3593/3593444.png'
          });
        } catch (e) {
          // Ignore errors for the test notification
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 ease-out text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <BellIcon className="w-10 h-10 text-purple-600 animate-shake" />
        </div>

        <h3 className="text-xl font-extrabold text-slate-800 mb-2">Enable Notifications</h3>
        
        <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
          Get notified when your timer ends, even if you lock your screen or switch apps.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={handleEnable}
            className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-purple-200 active:scale-95 transition-all"
          >
            Enable Notifications
          </button>
          
          <button 
            onClick={handleDismiss}
            className="w-full py-3 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};
