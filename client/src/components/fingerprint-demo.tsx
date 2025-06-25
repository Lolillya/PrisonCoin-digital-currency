import React, { useState } from 'react';
import { Button } from './ui/button';
import { FingerprintIcon, CheckIcon } from './icons/icons';
import { 
  registerFingerprint, 
  verifyFingerprint, 
  getFingerprintTemplate,
  storeFingerprintTemplate,
  FingerprintTemplate 
} from '../utils/fingerprint-auth';

export const FingerprintDemo = () => {
  const [inmateId, setInmateId] = useState('INMATE_001');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [registeredTemplate, setRegisteredTemplate] = useState<FingerprintTemplate | null>(null);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleRegister = async () => {
    if (!inmateId.trim()) {
      addLog('❌ Please enter an inmate ID');
      return;
    }

    setIsRegistering(true);
    addLog(`🔐 Starting fingerprint registration for ${inmateId}`);

    try {
      const template = await registerFingerprint(inmateId);
      storeFingerprintTemplate(template);
      setRegisteredTemplate(template);
      
      addLog(`✅ Registration successful! Template ID: ${template.id}`);
      addLog(`📊 Encrypted data length: ${template.encryptedData.length} characters`);
      
    } catch (error) {
      addLog(`❌ Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleVerify = async () => {
    if (!inmateId.trim()) {
      addLog('❌ Please enter an inmate ID');
      return;
    }

    const template = getFingerprintTemplate(inmateId);
    if (!template) {
      addLog('❌ No registered fingerprint found for this inmate');
      return;
    }

    setIsVerifying(true);
    addLog(`🔍 Starting fingerprint verification for ${inmateId}`);

    try {
      const result = await verifyFingerprint(template, inmateId);
      setVerificationResult(result);
      
      if (result) {
        addLog('✅ Fingerprint verification successful!');
      } else {
        addLog('❌ Fingerprint verification failed');
      }
      
    } catch (error) {
      addLog(`❌ Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setVerificationResult(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLoadExisting = () => {
    const template = getFingerprintTemplate(inmateId);
    if (template) {
      setRegisteredTemplate(template);
      addLog(`📋 Loaded existing template for ${inmateId}`);
    } else {
      addLog(`❌ No existing template found for ${inmateId}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🔐 Fingerprint Authentication Demo</h1>
        <p className="text-gray-600">Test the fingerprint registration and verification system</p>
      </div>

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
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <div className="flex gap-4">
          <Button 
            onClick={handleRegister} 
            disabled={isRegistering || isVerifying}
            className="flex items-center gap-2"
          >
            <FingerprintIcon width={20} height={20} />
            {isRegistering ? 'Registering...' : 'Register Fingerprint'}
          </Button>
          
          <Button 
            onClick={handleVerify} 
            disabled={isRegistering || isVerifying || !registeredTemplate}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800"
          >
            <CheckIcon />
            {isVerifying ? 'Verifying...' : 'Verify Fingerprint'}
          </Button>
          
          <Button onClick={clearLogs} className="bg-gray-100 hover:bg-gray-200 text-gray-800">
            Clear Logs
          </Button>
        </div>
      </div>

      {/* Status Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Registration Status */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Registration Status</h2>
          {registeredTemplate ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <CheckIcon />
                <span className="font-medium">Registered</span>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Template ID:</strong> {registeredTemplate.id}</p>
                <p><strong>Created:</strong> {new Date(registeredTemplate.createdAt).toLocaleString()}</p>
                <p><strong>Encrypted Data:</strong> {registeredTemplate.encryptedData.length} chars</p>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No fingerprint registered</div>
          )}
        </div>

        {/* Verification Status */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Verification Status</h2>
          {verificationResult === null ? (
            <div className="text-gray-500">No verification attempted</div>
          ) : verificationResult ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckIcon />
              <span className="font-medium">Verification Successful</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <span className="font-medium">Verification Failed</span>
            </div>
          )}
        </div>
      </div>

      {/* Console Logs */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Console Logs</h2>
        <div className="bg-gray-900 text-green-400 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <div className="text-gray-500">No logs yet. Start by registering or verifying a fingerprint.</div>
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
        <h2 className="text-xl font-semibold mb-4">How to Test</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Enter an inmate ID (e.g., "INMATE_001")</li>
          <li>Click "Register Fingerprint" to simulate fingerprint scanning and encryption</li>
          <li>Click "Verify Fingerprint" to test authentication against the registered template</li>
          <li>Watch the console logs for detailed information about the process</li>
          <li>Try different inmate IDs to test multiple registrations</li>
        </ol>
        <div className="mt-4 p-3 bg-yellow-100 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This is a simulation using the Web Crypto API. In a real application, 
            this would interface with actual fingerprint hardware and use more sophisticated 
            biometric matching algorithms.
          </p>
        </div>
      </div>
    </div>
  );
}; 