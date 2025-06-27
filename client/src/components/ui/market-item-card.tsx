import { useState } from 'react';
import { MarketItem, purchaseItemWithEth, InmateSearchResult } from '@/api/market';
import { Button } from './button';
import { FingerprintValidationModal } from './fingerprint-validation-modal';

interface MarketItemCardProps {
  item: MarketItem;
  inmateAddress: string;
  onPurchaseSuccess?: (transactionHash: string) => void;
  onPurchaseError?: (error: string) => void;
}

export const MarketItemCard = ({ item, inmateAddress, onPurchaseSuccess, onPurchaseError }: MarketItemCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showFingerprintModal, setShowFingerprintModal] = useState(false);
  const [validatedInmate, setValidatedInmate] = useState<InmateSearchResult | null>(null);

  const handlePurchase = async () => {
    if (!validatedInmate) {
      onPurchaseError?.("Please validate your fingerprint first");
      return;
    }

    setIsLoading(true);
    try {
      const response = await purchaseItemWithEth({
        inmateAddress: validatedInmate.walletAddress,
        item: item.name,
        amountInEth: item.costInEth
      });

      onPurchaseSuccess?.(response.transactionHash);
      setShowPurchaseModal(false);
      setValidatedInmate(null); // Reset validation
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to purchase item";
      onPurchaseError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidationSuccess = (inmate: InmateSearchResult) => {
    setValidatedInmate(inmate);
    setShowFingerprintModal(false);
    // Automatically open purchase modal after successful validation
    setShowPurchaseModal(true);
  };

  const handleValidationError = (error: string) => {
    onPurchaseError?.(error);
    setShowFingerprintModal(false);
  };

  return (
    <>
      <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-border/20 flex flex-col justify-between">
        {/* Item Header */}
        <div className="p-4 border-b border-border/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-text text-sm">{item.name}</h3>
                <span className="text-sm text-text/60 bg-background/40 px-2 py-1 rounded-full text-center">
                  {item.category}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-text">
                {item.costInEth.toFixed(4)} ETH
              </div>
              <div className="text-xs text-text/60">
                ~${(item.costInEth * 2000).toFixed(2)} USD
              </div>
            </div>
          </div>
        </div>

        {/* Item Description */}
        <div className="p-4">
          <p className="text-text/80 text-sm leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Purchase Button */}
        <div className="p-4 bg-background/20">
          <Button
            onClick={() => setShowPurchaseModal(true)}
            disabled={isLoading}
            className="w-full font-medium py-2 px-4 rounded-md  flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-text border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                Purchase Item
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-secondary border border-border rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text">Confirm Purchase</h3>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="text-text/60 hover:text-text transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-background/20 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-text/80 text-sm">Item:</span>
                  <span className="font-medium text-text">{item.name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-text/80 text-sm">Category:</span>
                  <span className="text-text/60 text-sm">{item.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text/80 text-sm">Price:</span>
                  <span className="font-medium text-highlight">{item.costInEth.toFixed(4)} ETH</span>
                </div>
              </div>
              
              {validatedInmate ? (
                <div className="bg-success/20 p-4 rounded-lg border border-success">
                  <div className="flex justify-between items-start">
                    <span className="text-text/80 text-sm">Validated Inmate:</span>
                    <div className="text-right">
                      <div className="font-medium text-success text-sm">{validatedInmate.fullName}</div>
                      <div className="text-success/60 text-xs">{validatedInmate.inmateNumber}</div>
                      <div className="text-success/60 text-xs font-mono">{validatedInmate.walletAddress.slice(0, 10)}...</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-alert/20 p-4 rounded-lg border border-alert">
                  <div className="flex justify-between items-start">
                    <span className="text-text/80 text-sm">Inmate Validation:</span>
                    <span className="text-alert text-sm">Required</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 font-medium rounded-md transition-colors duration-200"
              >
                Cancel
              </Button>
              {validatedInmate ? (
                <Button
                  onClick={handlePurchase}
                  disabled={isLoading}
                  className="flex-1 text-text font-medium py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-text border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span>💳</span>
                      Confirm Purchase
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setShowPurchaseModal(false);
                    setShowFingerprintModal(true);
                  }}
                  className="flex-1 text-text font-medium py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <span>👆</span>
                  Validate Fingerprint
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fingerprint Validation Modal */}
      <FingerprintValidationModal
        isOpen={showFingerprintModal}
        onClose={() => setShowFingerprintModal(false)}
        onValidationSuccess={handleValidationSuccess}
        onValidationError={handleValidationError}
      />
    </>
  );
}; 