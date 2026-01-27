import React, { useState } from 'react';

interface DeleteConfirmationModalProps {
  title: string;
  message: string;
  warningMessage?: string;
  itemName: string;
  scoreCount?: number;
  players?: string[];
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  title,
  message,
  warningMessage,
  itemName,
  scoreCount = 0,
  players = [],
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmationText, setConfirmationText] = useState('');

  const handleConfirmStep1 = () => {
    setStep(2);
  };

  const handleConfirmStep2 = () => {
    if (confirmationText === itemName) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    setStep(1);
    setConfirmationText('');
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{title}</h2>

        {step === 1 ? (
          <>
            <p className="text-gray-700 mb-4">{message}</p>

            {warningMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-medium">{warningMessage}</p>
              </div>
            )}

            {scoreCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 font-medium mb-2">
                  This tournament has {scoreCount} score{scoreCount !== 1 ? 's' : ''} that will be permanently deleted.
                </p>
                {players.length > 0 && (
                  <>
                    <p className="text-yellow-700 text-sm mb-1">Players affected:</p>
                    <ul className="text-yellow-700 text-sm list-disc list-inside">
                      {players.map((player, index) => (
                        <li key={index}>{player}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStep1}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={isDeleting}
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 font-medium mb-2">
                This action cannot be undone!
              </p>
              <p className="text-red-700 text-sm">
                Please type <span className="font-bold">{itemName}</span> to confirm deletion.
              </p>
            </div>

            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={`Type "${itemName}" here`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={isDeleting}
              autoFocus
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                disabled={isDeleting}
              >
                Back
              </button>
              <button
                onClick={handleConfirmStep2}
                disabled={confirmationText !== itemName || isDeleting}
                className={`px-4 py-2 rounded ${
                  confirmationText === itemName && !isDeleting
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
