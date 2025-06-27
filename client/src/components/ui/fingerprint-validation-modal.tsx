import { useState, useEffect } from 'react';
import { Button } from './button';
import { 
  verifyHardwareFingerprint, 
  getHardwareFingerprintTemplate,
  checkHardwareSupport,
  HardwareFingerprintTemplate 
} from '../../utils/hardware-fingerprint-auth';
import { searchInmateByFingerprint, InmateSearchResult } from '../../api/market';

interface FingerprintValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onValidationSuccess: (inmate: InmateSearchResult) => void;
  onValidationError: (error: string) => void;
}

export const FingerprintValidationModal = ({ 
  isOpen, 
  onClose, 
  onValidationSuccess, 
  onValidationError 
}: FingerprintValidationModalProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [hardwareSupport, setHardwareSupport] = useState<{
    supported: boolean;
    reasons: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [foundInmate, setFoundInmate] = useState<InmateSearchResult | null>(null);
  const [searchingDatabase, setSearchingDatabase] = useState(false);

  // Check hardware support on component mount
  useEffect(() => {
    const checkSupport = async () => {
      try {
        const support = await checkHardwareSupport();
        setHardwareSupport(support);

        if (!support.supported) {
          setError("Hardware fingerprint scanner not supported on this device");
        }
      } catch (error) {
        setError("Failed to check hardware support");
        console.error("Hardware support check failed:", error);
      }
    };

    if (isOpen) {
      checkSupport();
    }
  }, [isOpen]);

  const handleFingerprintScan = async () => {
    if (!hardwareSupport?.supported) {
      setError("Hardware fingerprint scanner not supported on this device");
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setError(null);
    setFoundInmate(null);

    try {
      console.log("🔍 Starting fingerprint validation process...");

      // Simulate progress updates during the scanning process
      const progressInterval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 50) {
            clearInterval(progressInterval);
            return 50;
          }
          return prev + 10;
        });
      }, 200);

      // Get all stored templates and try to verify with each one
      const storedTemplates = JSON.parse(
        localStorage.getItem('hardware_fingerprint_templates') || '[]'
      );

      if (storedTemplates.length === 0) {
        throw new Error("No registered fingerprints found. Please register inmates first.");
      }

      console.log(`🔍 Found ${storedTemplates.length} registered fingerprints, attempting verification...`);

      let verifiedTemplate: HardwareFingerprintTemplate | null = null;
      let verifiedInmateId: string | null = null;

      // Try to verify with each stored template
      for (const template of storedTemplates) {
        try {
          console.log(`🔍 Attempting verification with template: ${template.inmateId}`);
          const isVerified = await verifyHardwareFingerprint(template, template.inmateId);
          
          if (isVerified) {
            verifiedTemplate = template;
            verifiedInmateId = template.inmateId;
            console.log(`✅ Fingerprint verified for inmate: ${template.inmateId}`);
            break;
          }
        } catch (error) {
          console.log(`❌ Verification failed for template: ${template.inmateId}`, error);
          continue;
        }
      }

      if (!verifiedTemplate || !verifiedInmateId) {
        throw new Error("Fingerprint verification failed. Please try again.");
      }

      clearInterval(progressInterval);
      setScanProgress(75);

      // Search for the inmate in the database
      setSearchingDatabase(true);
      console.log(`🔍 Searching database for inmate: ${verifiedInmateId}`);

      const inmate = await searchInmateByFingerprint(verifiedTemplate.id);

      if (!inmate) {
        throw new Error("Inmate not found in database. Please ensure the inmate is properly registered.");
      }

      setFoundInmate(inmate);
      setScanProgress(100);

      console.log("✅ Inmate found in database:", inmate);

      // Close modal after a short delay
      setTimeout(() => {
        onValidationSuccess(inmate);
        onClose();
      }, 1500);

    } catch (error) {
      console.error("❌ Fingerprint validation failed:", error);
      setError(error instanceof Error ? error.message : "Fingerprint validation failed");
      setIsScanning(false);
      setSearchingDatabase(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-secondary border border-border rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text">Fingerprint Validation</h3>
          <button
            onClick={onClose}
            className="text-text/60 hover:text-text transition-colors"
            disabled={isScanning}
          >
            ✕
          </button>
        </div>

        {/* Hardware Support Status */}
        {hardwareSupport && !hardwareSupport.supported && (
          <div className="mb-4 p-3 bg-alert/20 border border-alert rounded-lg">
            <p className="text-alert text-sm font-medium mb-2">Hardware Not Supported</p>
            <ul className="text-alert/80 text-xs space-y-1">
              {hardwareSupport.reasons.map((reason, index) => (
                <li key={index}>• {reason}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-alert/20 border border-alert rounded-lg">
            <p className="text-alert text-sm">{error}</p>
          </div>
        )}

        {/* Success Display */}
        {foundInmate && (
          <div className="mb-4 p-3 bg-success/20 border border-success rounded-lg">
            <p className="text-success text-sm font-medium mb-2">✅ Inmate Found!</p>
            <div className="text-success/80 text-xs space-y-1">
              <p><strong>Name:</strong> {foundInmate.fullName}</p>
              <p><strong>ID:</strong> {foundInmate.inmateNumber}</p>
              <p><strong>Wallet:</strong> {foundInmate.walletAddress.slice(0, 10)}...</p>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isScanning && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-text/60 mb-1">
              <span>Scanning Fingerprint...</span>
              <span>{scanProgress}%</span>
            </div>
            <div className="w-full bg-background/20 rounded-full h-2">
              <div 
                className="bg-highlight h-2 rounded-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
            {searchingDatabase && scanProgress >= 75 && (
              <p className="text-xs text-text/60 mt-1">Searching database...</p>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mb-6">
          <p className="text-text/80 text-sm mb-3">
            Place your finger on the fingerprint scanner to validate your identity and search for your inmate record.
          </p>
          <div className="bg-background/20 p-3 rounded-lg">
            <p className="text-text/60 text-xs">
              <strong>Note:</strong> This will search for your fingerprint in the registered inmates database.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            disabled={isScanning}
            className="flex-1 font-medium rounded-md transition-colors duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleFingerprintScan}
            disabled={isScanning || !hardwareSupport?.supported}
            className="flex-1 text-text font-medium py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isScanning ? (
              <>
                <div className="w-4 h-4 border-2 border-text border-t-transparent rounded-full animate-spin"></div>
                {searchingDatabase ? 'Searching...' : 'Scanning...'}
              </>
            ) : (
              <>
                <span>👆</span>
                Scan Fingerprint
              </>
            )}
          </Button>
        </div>

        {/* Status Messages */}
        {isScanning && (
          <div className="mt-4 text-center">
            <p className="text-text/60 text-xs">
              {scanProgress < 50 
                ? "Please place your finger on the scanner when prompted..." 
                : scanProgress < 75 
                ? "Verifying fingerprint..." 
                : "Searching inmate database..."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 