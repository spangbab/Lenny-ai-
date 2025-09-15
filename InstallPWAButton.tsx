import React, { useState, useEffect } from 'react';
import DownloadIcon from './icons/DownloadIcon';

// This interface is a stand-in for the actual BeforeInstallPromptEvent type
// which is not yet part of the standard DOM library definitions.
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallPWAButton: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing automatically
      e.preventDefault();
      // Stash the event so it can be triggered later by the user.
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for the appinstalled event to know when the PWA is installed
    const handleAppInstalled = () => {
      // Hide the install button as the app is now installed
      setInstallPrompt(null);
      console.log('Lenny AI was installed.');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      return;
    }
    // Show the browser's installation prompt
    await installPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the PWA installation prompt');
    } else {
      console.log('User dismissed the PWA installation prompt');
    }
    // The prompt can only be used once, so clear it.
    setInstallPrompt(null);
  };

  // Only render the button if the installation prompt is available
  if (!installPrompt) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors"
      aria-label="Install Lenny AI"
      title="Install Lenny AI"
    >
      <DownloadIcon />
      <span>Install App</span>
    </button>
  );
};

export default InstallPWAButton;
