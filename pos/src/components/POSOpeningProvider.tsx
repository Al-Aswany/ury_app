import { useEffect, useState } from 'react';
import { checkPOSOpening } from '../lib/pos-opening-api';
import POSOpeningDialog from './POSOpeningDialog';

interface POSOpeningProviderProps {
  children: React.ReactNode;
}

const POSOpeningProvider = ({ children }: POSOpeningProviderProps) => {
  const [isPOSOpened, setIsPOSOpened] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkPOSStatus = async () => {
    try {
      const response = await checkPOSOpening();
      // If message is 1, POS is not opened (show dialog)
      // If message is 0, POS is opened (allow access)
      setIsPOSOpened(response.message === 0);
    } catch (error) {
      console.error('Failed to check POS opening status:', error);
      // On error, assume POS is not opened for safety
      setIsPOSOpened(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  useEffect(() => {
    checkPOSStatus();
  }, []);

  // Show loading state while checking
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking POS status...</p>
        </div>
      </div>
    );
  }

  // Show dialog if POS is not opened
  if (isPOSOpened === false) {
    return <POSOpeningDialog onReload={handleReload} />;
  }

  // Render children if POS is opened
  return <>{children}</>;
};

export default POSOpeningProvider; 