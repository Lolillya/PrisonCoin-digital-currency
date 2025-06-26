import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { FingerprintIcon, CheckIcon, AlertTriangleIcon } from './icons/icons';
import { 
  registerHardwareFingerprint, 
  verifyHardwareFingerprint, 
  getHardwareFingerprintTemplate,
  storeHardwareFingerprintTemplate,
  getDeviceInfo,
  checkHardwareSupport,
  debugWebAuthnCredentials,
  clearInmateHardwareFingerprint,
  clearHardwareFingerprintTemplates,
  HardwareFingerprintTemplate 
} from '../utils/hardware-fingerprint-auth';

export const HardwareFingerprintDemo = () => {
  const [inmateId, setInmateId] = useState('INMATE_001');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [registeredTemplate, setRegisteredTemplate] = useState<HardwareFingerprintTemplate | null>(null);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<{
    webAuthnSupported: boolean;
    biometricSupported: boolean;
    authenticators: string[];
  } | null>(null);
  const [hardwareSupport, setHardwareSupport] = useState<{
    supported: boolean;
    reasons: string[];
  } | null>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Check device support on component mount
  useEffect(() => {
    const checkSupport = async () => {
      addLog("🔍 Checking hardware fingerprint support...");
      
      try {
        const device = await getDeviceInfo();
        setDeviceInfo(device);
        
        const support = await checkHardwareSupport();
        setHardwareSupport(support);
        
        if (support.supported) {
          addLog("✅ Hardware fingerprint support confirmed");
          addLog(`📱 Available authenticators: ${device.authenticators.join(', ')}`);
        } else {
          addLog("❌ Hardware fingerprint not supported");
          support.reasons.forEach(reason => addLog(`⚠️ ${reason}`));
        }
      } catch (error) {
        addLog(`❌ Error checking support: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    
    checkSupport();
  }, []);

  const handleRegister = async () => {
    if (!inmateId.trim()) {
      addLog('❌ Please enter an inmate ID');
      return;
    }

    if (!hardwareSupport?.supported) {
      addLog('❌ Hardware fingerprint not supported on this device');
      return;
    }

    setIsRegistering(true);
    addLog(`🔐 Starting hardware fingerprint registration for ${inmateId}`);
    addLog("👆 Please place your finger on the fingerprint scanner when prompted");

    try {
      const template = await registerHardwareFingerprint(inmateId);
      storeHardwareFingerprintTemplate(template);
      setRegisteredTemplate(template);
      
      addLog(`✅ Hardware registration successful! Template ID: ${template.id}`);
      addLog(`📊 Device: ${template.deviceInfo.name}`);
      addLog(`🔑 Credential ID: ${template.credentialId.substring(0, 20)}...`);
      
    } catch (error) {
      addLog(`❌ Hardware registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleVerify = async () => {
    if (!inmateId.trim()) {
      addLog('❌ Please enter an inmate ID');
      return;
    }

    if (!hardwareSupport?.supported) {
      addLog('❌ Hardware fingerprint not supported on this device');
      return;
    }

    const template = getHardwareFingerprintTemplate(inmateId);
    if (!template) {
      addLog('❌ No registered hardware fingerprint found for this inmate');
      addLog('💡 Please register a fingerprint first');
      return;
    }

    setIsVerifying(true);
    addLog(`🔍 Starting hardware fingerprint verification for ${inmateId}`);
    addLog("👆 Please place your finger on the fingerprint scanner when prompted");
    addLog("📋 Template found: " + template.id);
    addLog("📱 Device: " + template.deviceInfo.name);

    try {
      const result = await verifyHardwareFingerprint(template, inmateId);
      setVerificationResult(result);
      
      if (result) {
        addLog('✅ Hardware fingerprint verification successful!');
        addLog('🎉 Authentication completed successfully');
      } else {
        addLog('❌ Hardware fingerprint verification failed');
        addLog('💡 Check the browser console for detailed error information');
        addLog('💡 Make sure you complete the fingerprint scan when prompted');
      }
      
    } catch (error) {
      addLog(`❌ Hardware verification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (error instanceof Error) {
        addLog(`🔍 Error type: ${error.name}`);
        addLog(`📝 Error details: ${error.message}`);
      }
      setVerificationResult(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLoadExisting = () => {
    const template = getHardwareFingerprintTemplate(inmateId);
    if (template) {
      setRegisteredTemplate(template);
      addLog(`📋 Loaded existing hardware template for ${inmateId}`);
      addLog(`📊 Device: ${template.deviceInfo.name}`);
    } else {
      addLog(`❌ No existing hardware template found for ${inmateId}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const handleDebug = async () => {
    addLog("🔍 Starting WebAuthn debug...");
    try {
      await debugWebAuthnCredentials();
      addLog("✅ Debug completed - check browser console for details");
    } catch (error) {
      addLog(`❌ Debug failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleClearInmate = () => {
    if (!inmateId.trim()) {
      addLog('❌ Please enter an inmate ID to clear');
      return;
    }
    clearInmateHardwareFingerprint(inmateId);
    setRegisteredTemplate(null);
    setVerificationResult(null);
    addLog(`🗑️ Cleared hardware fingerprint for ${inmateId}`);
  };

  const handleClearAll = () => {
    clearHardwareFingerprintTemplates();
    setRegisteredTemplate(null);
    setVerificationResult(null);
    addLog("🗑️ Cleared all hardware fingerprints");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🔐 Hardware Fingerprint Authentication</h1>
        <p className="text-gray-600">Test your laptop's fingerprint scanner with WebAuthn</p>
      </div>

      {/* Hardware Support Status */}
      {hardwareSupport && (
        <div className={`p-4 rounded-lg ${hardwareSupport.supported ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            {hardwareSupport.supported ? (
              <CheckIcon />
            ) : (
              <AlertTriangleIcon />
            )}
            <h3 className="font-semibold">
              {hardwareSupport.supported ? 'Hardware Fingerprint Supported' : 'Hardware Fingerprint Not Supported'}
            </h3>
          </div>
          {!hardwareSupport.supported && (
            <div className="text-sm text-red-700">
              <p className="font-medium mb-1">Reasons:</p>
              <ul className="list-disc list-inside space-y-1">
                {hardwareSupport.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
          {deviceInfo && (
            <div className="text-sm mt-2">
              <p><strong>WebAuthn Support:</strong> {deviceInfo.webAuthnSupported ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Biometric Support:</strong> {deviceInfo.biometricSupported ? '✅ Yes' : '❌ No'}</p>
              {deviceInfo.authenticators.length > 0 && (
                <p><strong>Available Authenticators:</strong> {deviceInfo.authenticators.join(', ')}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Input Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Configuration</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Inmate ID</label>
            <input
              type="text"
              value={inmateId}
              onChange={(e) => setInmateId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter inmate ID"
            />
          </div>
          <Button onClick={handleLoadExisting} disabled={isRegistering || isVerifying}>
            Load Existing
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Hardware Fingerprint Actions</h2>
        <div className="flex gap-4">
          <Button 
            onClick={handleRegister} 
            disabled={isRegistering || isVerifying || !hardwareSupport?.supported}
            className="flex items-center gap-2"
          >
            <FingerprintIcon width={20} height={20} />
            {isRegistering ? 'Scanning...' : 'Register Hardware Fingerprint'}
          </Button>
          
          <Button 
            onClick={handleVerify} 
            disabled={isRegistering || isVerifying || !registeredTemplate || !hardwareSupport?.supported}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800"
          >
            <CheckIcon />
            {isVerifying ? 'Verifying...' : 'Verify Hardware Fingerprint'}
          </Button>
          
          <Button onClick={clearLogs} className="bg-gray-100 hover:bg-gray-200 text-gray-800">
            Clear Logs
          </Button>
          
          <Button onClick={handleDebug} className="bg-blue-100 hover:bg-blue-200 text-blue-800">
            Debug WebAuthn
          </Button>
          
          <Button onClick={handleClearInmate} className="bg-orange-100 hover:bg-orange-200 text-orange-800">
            Clear Inmate
          </Button>
          
          <Button onClick={handleClearAll} className="bg-red-100 hover:bg-red-200 text-red-800">
            Clear All
          </Button>
        </div>
        
        {!hardwareSupport?.supported && (
          <div className="mt-4 p-3 bg-yellow-100 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Hardware fingerprint requires HTTPS (except localhost), 
              a supported browser, and a built-in fingerprint reader.
            </p>
          </div>
        )}
      </div>

      {/* Status Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Registration Status */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Hardware Registration Status</h2>
          {registeredTemplate ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <CheckIcon />
                <span className="font-medium">Registered</span>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Template ID:</strong> {registeredTemplate.id}</p>
                <p><strong>Device:</strong> {registeredTemplate.deviceInfo.name}</p>
                <p><strong>Created:</strong> {new Date(registeredTemplate.createdAt).toLocaleString()}</p>
                <p><strong>Credential ID:</strong> {registeredTemplate.credentialId.substring(0, 20)}...</p>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No hardware fingerprint registered</div>
          )}
        </div>

        {/* Verification Status */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Hardware Verification Status</h2>
          {verificationResult === null ? (
            <div className="text-gray-500">No verification attempted</div>
          ) : verificationResult ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckIcon />
              <span className="font-medium">Hardware Verification Successful</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <span className="font-medium">Hardware Verification Failed</span>
            </div>
          )}
        </div>
      </div>

      {/* Console Logs */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Hardware Console Logs</h2>
        <div className="bg-gray-900 text-green-400 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <div className="text-gray-500">No logs yet. Start by registering or verifying a hardware fingerprint.</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">How to Test Hardware Fingerprint</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Ensure you're using HTTPS or localhost (WebAuthn requirement)</li>
          <li>Use a supported browser (Chrome 67+, Firefox 60+, Safari 13+, Edge 18+)</li>
          <li>Have a built-in fingerprint reader on your laptop</li>
          <li>Enter an inmate ID (e.g., "INMATE_001")</li>
          <li>Click "Register Hardware Fingerprint" - your browser will prompt for fingerprint</li>
          <li>Place your finger on the scanner when prompted</li>
          <li>Click "Verify Hardware Fingerprint" to test authentication</li>
          <li>Watch the console logs for detailed information</li>
        </ol>
        <div className="mt-4 p-3 bg-yellow-100 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> This uses the Web Authentication API (WebAuthn) to access your 
            laptop's built-in fingerprint reader. The browser will show a native prompt asking for 
            your fingerprint when you register or verify.
          </p>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-red-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-red-800">Troubleshooting</h2>
        <div className="space-y-3 text-sm">
          <div>
            <h3 className="font-medium text-red-700">If verification fails with no prompt:</h3>
            <ul className="list-disc list-inside ml-4 space-y-1 text-red-600">
              <li>Click "Debug WebAuthn" to check system compatibility</li>
              <li>Ensure you're using HTTPS or localhost</li>
              <li>Check if your fingerprint reader is properly configured</li>
              <li>Try registering a new fingerprint first</li>
              <li>Clear browser data and try again</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-red-700">If no fingerprint prompt appears:</h3>
            <ul className="list-disc list-inside ml-4 space-y-1 text-red-600">
              <li>Check browser console for detailed error messages</li>
              <li>Ensure Windows Hello or Touch ID is set up</li>
              <li>Try a different browser (Chrome recommended)</li>
              <li>Check if your laptop has a fingerprint reader</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-red-700">Common error messages:</h3>
            <ul className="list-disc list-inside ml-4 space-y-1 text-red-600">
              <li><strong>NotAllowedError:</strong> User cancelled or denied permission</li>
              <li><strong>InvalidStateError:</strong> No fingerprint registered for this user</li>
              <li><strong>NotSupportedError:</strong> Fingerprint reader not available</li>
              <li><strong>SecurityError:</strong> HTTPS required (use localhost for testing)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}; 