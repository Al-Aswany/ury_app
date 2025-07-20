import { RefreshCw } from 'lucide-react';
import { Button } from './ui';

interface POSOpeningDialogProps {
  onReload: () => void;
}

const POSOpeningDialog = ({ onReload }: POSOpeningDialogProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <RefreshCw className="h-8 w-8 text-red-600" />
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            POS Not Opened
          </h2>
          
          {/* Message */}
          <p className="text-gray-600 mb-8 text-lg">
            Please open POS Entry to continue using the system.
          </p>
          
          {/* Reload Button */}
          <Button
            onClick={onReload}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default POSOpeningDialog; 