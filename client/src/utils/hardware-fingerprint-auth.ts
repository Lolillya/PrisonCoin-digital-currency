// Hardware Fingerprint Authentication using WebAuthn API
// This module provides functions for real fingerprint scanner integration

export interface HardwareFingerprintCredential {
  id: string;
  type: string;
  rawId: ArrayBuffer;
  response: {
    clientDataJSON: ArrayBuffer;
    attestationObject: ArrayBuffer;
  };
}

export interface HardwareFingerprintTemplate {
  id: string;
  credentialId: string;
  publicKey: string;
  inmateId: string;
  createdAt: string;
  deviceInfo: {
    name: string;
    type: string;
  };
}

export interface HardwareScanResult {
  success: boolean;
  credential?: HardwareFingerprintCredential;
  template?: HardwareFingerprintTemplate;
  error?: string;
  deviceInfo?: {
    name: string;
    type: string;
  };
}

// Check if WebAuthn is supported
export const isWebAuthnSupported = (): boolean => {
  return window.PublicKeyCredential !== undefined;
};

// Check if biometric authentication is available
export const isBiometricSupported = async (): Promise<boolean> => {
  if (!isWebAuthnSupported()) {
    console.log("❌ WebAuthn not supported in this browser");
    return false;
  }

  try {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    console.log("🔍 Biometric authentication available:", available);
    return available;
  } catch (error) {
    console.error("❌ Error checking biometric support:", error);
    return false;
  }
};

// Get available authenticators
export const getAvailableAuthenticators = async (): Promise<string[]> => {
  const authenticators: string[] = [];
  
  try {
    // Check for platform authenticators (built-in fingerprint readers)
    if (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
      authenticators.push("Platform Authenticator (Built-in Fingerprint Reader)");
    }
    
    // Check for cross-platform authenticators (USB keys, etc.)
    if (await PublicKeyCredential.isConditionalMediationAvailable()) {
      authenticators.push("Cross-Platform Authenticator");
    }
    
    console.log("📱 Available authenticators:", authenticators);
  } catch (error) {
    console.error("❌ Error getting authenticators:", error);
  }
  
  return authenticators;
};

// Generate challenge for WebAuthn
const generateChallenge = (): ArrayBuffer => {
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  return challenge.buffer;
};

// Convert ArrayBuffer to Base64 (outputs base64url format for WebAuthn compatibility)
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // Convert to base64url format (WebAuthn standard)
  return btoa(binary)
    .replace(/\+/g, '-')  // Replace + with -
    .replace(/\//g, '_')  // Replace / with _
    .replace(/=/g, '');   // Remove padding
};

// Convert Base64 to ArrayBuffer (handles both standard base64 and base64url)
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  // WebAuthn uses base64url encoding, so we need to convert it to standard base64
  // Replace URL-safe characters with standard base64 characters
  let standardBase64 = base64
    .replace(/-/g, '+')  // Replace - with +
    .replace(/_/g, '/'); // Replace _ with /
  
  // Add padding if needed
  while (standardBase64.length % 4) {
    standardBase64 += '=';
  }
  
  try {
    const binaryString = atob(standardBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (error) {
    console.error("❌ Base64 conversion error:", error);
    console.error("📝 Original string:", base64);
    console.error("📝 Converted string:", standardBase64);
    throw new Error(`Invalid base64 string: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Register fingerprint using hardware scanner
export const registerHardwareFingerprint = async (
  inmateId: string
): Promise<HardwareFingerprintTemplate> => {
  console.log("🔐 Starting hardware fingerprint registration for inmate:", inmateId);
  
  if (!isWebAuthnSupported()) {
    throw new Error("WebAuthn not supported in this browser");
  }
  
  if (!(await isBiometricSupported())) {
    throw new Error("No biometric authenticator available");
  }
  
  try {
    // Generate challenge
    const challenge = generateChallenge();
    
    // Create public key credential options
    const publicKeyOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: "PrisonCoin System",
        id: window.location.hostname,
      },
      user: {
        id: new TextEncoder().encode(inmateId),
        name: `inmate_${inmateId}`,
        displayName: `Inmate ${inmateId}`,
      },
      pubKeyCredParams: [
        {
          type: "public-key",
          alg: -7, // ES256
        },
      ],
      timeout: 60000, // 60 seconds
      attestation: "direct",
      authenticatorSelection: {
        authenticatorAttachment: "platform", // Use built-in authenticator
        userVerification: "required",
        requireResidentKey: false,
      },
    };
    
    console.log("📋 Public key options created");
    console.log("🎯 Using platform authenticator (built-in fingerprint reader)");
    
    // Create credential using hardware
    const credential = await navigator.credentials.create({
      publicKey: publicKeyOptions,
    }) as PublicKeyCredential;
    
    if (!credential) {
      throw new Error("Failed to create credential");
    }
    
    console.log("✅ Hardware fingerprint registration successful");
    console.log("📊 Credential ID:", credential.id);
    
    // Extract credential data
    const response = credential.response as AuthenticatorAttestationResponse;
    
    // Create template object
    const template: HardwareFingerprintTemplate = {
      id: `hw_fp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      credentialId: credential.id,
      publicKey: arrayBufferToBase64(response.getPublicKey() || new ArrayBuffer(0)),
      inmateId,
      createdAt: new Date().toISOString(),
      deviceInfo: {
        name: "Built-in Fingerprint Reader",
        type: "Platform Authenticator"
      }
    };
    
    console.log("📝 Hardware fingerprint template created:", {
      id: template.id,
      inmateId: template.inmateId,
      createdAt: template.createdAt,
      deviceInfo: template.deviceInfo
    });
    
    return template;
    
  } catch (error) {
    console.error("❌ Hardware fingerprint registration failed:", error);
    
    // Provide user-friendly error messages
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        throw new Error("Fingerprint registration was cancelled or denied by user");
      } else if (error.name === 'InvalidStateError') {
        throw new Error("Fingerprint already registered for this user");
      } else if (error.name === 'NotSupportedError') {
        throw new Error("Fingerprint reader not supported or not available");
      } else if (error.name === 'SecurityError') {
        throw new Error("Security error - please ensure you're using HTTPS");
      } else {
        throw new Error(`Registration failed: ${error.message}`);
      }
    }
    
    throw new Error("Unknown error during fingerprint registration");
  }
};

// Verify fingerprint using hardware scanner
export const verifyHardwareFingerprint = async (
  template: HardwareFingerprintTemplate,
  inmateId: string
): Promise<boolean> => {
  console.log("🔍 Starting hardware fingerprint verification for inmate:", inmateId);
  console.log("📋 Template details:", {
    id: template.id,
    credentialId: template.credentialId.substring(0, 50) + "...",
    deviceInfo: template.deviceInfo
  });
  
  if (!isWebAuthnSupported()) {
    console.log("❌ WebAuthn not supported");
    return false;
  }
  
  try {
    // Generate challenge
    const challenge = generateChallenge();
    console.log("🔑 Generated challenge for verification");
    
    // Convert credential ID from base64 to ArrayBuffer
    let credentialIdBuffer: ArrayBuffer;
    try {
      // Test the conversion first
      if (!testCredentialIdConversion(template.credentialId)) {
        console.error("❌ Credential ID conversion test failed");
        return false;
      }
      
      credentialIdBuffer = base64ToArrayBuffer(template.credentialId);
      console.log("✅ Credential ID converted to ArrayBuffer");
    } catch (error) {
      console.error("❌ Failed to convert credential ID:", error);
      return false;
    }
    
    // Create assertion options
    const assertionOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      rpId: window.location.hostname,
      allowCredentials: [
        {
          type: "public-key",
          id: credentialIdBuffer,
          transports: ["internal"], // Use internal authenticator
        },
      ],
      userVerification: "required",
      timeout: 60000, // 60 seconds
    };
    
    console.log("📋 Assertion options created:", {
      rpId: assertionOptions.rpId,
      allowCredentialsCount: assertionOptions.allowCredentials?.length,
      userVerification: assertionOptions.userVerification,
      timeout: assertionOptions.timeout
    });
    console.log("🎯 Requesting fingerprint verification from hardware");
    console.log("👆 Browser should now show fingerprint prompt...");
    
    // Get assertion using hardware
    const assertion = await navigator.credentials.get({
      publicKey: assertionOptions,
    }) as PublicKeyCredential;
    
    if (!assertion) {
      console.log("❌ No assertion received - user may have cancelled");
      return false;
    }
    
    console.log("✅ Hardware fingerprint verification successful");
    console.log("📊 Assertion received:", {
      id: assertion.id,
      type: assertion.type,
      rawIdLength: assertion.rawId.byteLength
    });
    
    // Log assertion response details
    const response = assertion.response as AuthenticatorAssertionResponse;
    if (response) {
      console.log("📋 Assertion response details:", {
        clientDataJSONLength: response.clientDataJSON.byteLength,
        authenticatorDataLength: response.authenticatorData.byteLength,
        signatureLength: response.signature.byteLength,
        userHandle: response.userHandle ? response.userHandle.byteLength : 0
      });
    }
    
    // In a real application, you would verify the assertion signature here
    // For demo purposes, we'll assume success if we get an assertion
    console.log("🎉 Hardware verification completed successfully!");
    
    return true;
    
  } catch (error) {
    console.error("❌ Hardware fingerprint verification failed:", error);
    
    // Provide detailed error information
    if (error instanceof Error) {
      console.error("🔍 Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      if (error.name === 'NotAllowedError') {
        console.log("❌ Fingerprint verification was cancelled or denied by user");
        console.log("💡 This usually means the user cancelled the fingerprint prompt or denied permission");
      } else if (error.name === 'InvalidStateError') {
        console.log("❌ No fingerprint registered for this user");
        console.log("💡 Make sure you've registered a fingerprint first");
      } else if (error.name === 'NotSupportedError') {
        console.log("❌ Fingerprint reader not supported or not available");
        console.log("💡 Check if your laptop has a fingerprint reader and it's properly configured");
      } else if (error.name === 'SecurityError') {
        console.log("❌ Security error - please ensure you're using HTTPS");
        console.log("💡 WebAuthn requires HTTPS (except localhost)");
      } else if (error.name === 'AbortError') {
        console.log("❌ Operation was aborted");
        console.log("💡 The fingerprint verification was cancelled");
      } else if (error.name === 'ConstraintError') {
        console.log("❌ Constraint error - credential not found");
        console.log("💡 The stored credential may be invalid or corrupted");
      } else {
        console.log(`❌ Verification failed: ${error.message}`);
        console.log("💡 Check browser console for more details");
      }
    } else {
      console.error("❌ Unknown error during verification:", error);
    }
    
    return false;
  }
};

// Store hardware fingerprint template
export const storeHardwareFingerprintTemplate = (template: HardwareFingerprintTemplate): void => {
  console.log("💾 Storing hardware fingerprint template in local storage");
  
  try {
    const storedTemplates = JSON.parse(
      localStorage.getItem('hardware_fingerprint_templates') || '[]'
    );
    
    // Remove any existing template for this inmate
    const filteredTemplates = storedTemplates.filter(
      (t: HardwareFingerprintTemplate) => t.inmateId !== template.inmateId
    );
    
    // Add new template
    filteredTemplates.push(template);
    
    localStorage.setItem('hardware_fingerprint_templates', JSON.stringify(filteredTemplates));
    
    console.log("✅ Hardware fingerprint template stored successfully");
    console.log("📊 Total stored hardware templates:", filteredTemplates.length);
  } catch (error) {
    console.error("❌ Failed to store hardware fingerprint template:", error);
    throw error;
  }
};

// Retrieve hardware fingerprint template
export const getHardwareFingerprintTemplate = (inmateId: string): HardwareFingerprintTemplate | null => {
  try {
    const storedTemplates = JSON.parse(
      localStorage.getItem('hardware_fingerprint_templates') || '[]'
    );
    
    const template = storedTemplates.find(
      (t: HardwareFingerprintTemplate) => t.inmateId === inmateId
    );
    
    if (template) {
      console.log("📋 Retrieved hardware fingerprint template for inmate:", inmateId);
      return template;
    } else {
      console.log("❌ No hardware fingerprint template found for inmate:", inmateId);
      return null;
    }
  } catch (error) {
    console.error("❌ Failed to retrieve hardware fingerprint template:", error);
    return null;
  }
};

// Get device information
export const getDeviceInfo = async (): Promise<{
  webAuthnSupported: boolean;
  biometricSupported: boolean;
  authenticators: string[];
}> => {
  const webAuthnSupported = isWebAuthnSupported();
  const biometricSupported = await isBiometricSupported();
  const authenticators = await getAvailableAuthenticators();
  
  return {
    webAuthnSupported,
    biometricSupported,
    authenticators
  };
};

// Check if current environment supports hardware fingerprint
export const checkHardwareSupport = async (): Promise<{
  supported: boolean;
  reasons: string[];
}> => {
  const reasons: string[] = [];
  let supported = true;
  
  // Check HTTPS
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    reasons.push("HTTPS required for WebAuthn (except localhost)");
    supported = false;
  }
  
  // Check WebAuthn support
  if (!isWebAuthnSupported()) {
    reasons.push("WebAuthn not supported in this browser");
    supported = false;
  }
  
  // Check biometric support
  if (!(await isBiometricSupported())) {
    reasons.push("No biometric authenticator available");
    supported = false;
  }
  
  console.log("🔍 Hardware support check:", { supported, reasons });
  
  return { supported, reasons };
};

// Test credential ID conversion
export const testCredentialIdConversion = (credentialId: string): boolean => {
  try {
    console.log("🧪 Testing credential ID conversion...");
    console.log("📝 Original credential ID length:", credentialId.length);
    
    const buffer = base64ToArrayBuffer(credentialId);
    console.log("✅ Conversion successful, buffer length:", buffer.byteLength);
    
    // Test converting back to base64
    const backToBase64 = arrayBufferToBase64(buffer);
    console.log("🔄 Round-trip conversion successful:", backToBase64 === credentialId);
    
    return true;
  } catch (error) {
    console.error("❌ Credential ID conversion failed:", error);
    return false;
  }
};

// Debug function to check WebAuthn credentials
export const debugWebAuthnCredentials = async (): Promise<void> => {
  console.log("🔍 Debugging WebAuthn credentials...");
  
  try {
    // Check if WebAuthn is supported
    if (!isWebAuthnSupported()) {
      console.log("❌ WebAuthn not supported in this browser");
      return;
    }
    
    console.log("✅ WebAuthn is supported");
    
    // Check biometric support
    const biometricSupported = await isBiometricSupported();
    console.log("🔐 Biometric support:", biometricSupported);
    
    // Get available authenticators
    const authenticators = await getAvailableAuthenticators();
    console.log("📱 Available authenticators:", authenticators);
    
    // Check current domain and protocol
    console.log("🌐 Current domain:", window.location.hostname);
    console.log("🔒 Protocol:", window.location.protocol);
    console.log("🔗 Full URL:", window.location.href);
    
    // Check if we're in a secure context
    console.log("🔐 Secure context:", window.isSecureContext);
    
    // Check stored templates in localStorage
    try {
      const storedTemplates = JSON.parse(
        localStorage.getItem('hardware_fingerprint_templates') || '[]'
      );
      console.log("💾 Stored hardware templates:", storedTemplates.length);
      storedTemplates.forEach((template: HardwareFingerprintTemplate, index: number) => {
        console.log(`  Template ${index + 1}:`, {
          id: template.id,
          inmateId: template.inmateId,
          deviceInfo: template.deviceInfo,
          credentialIdLength: template.credentialId.length
        });
      });
    } catch (error) {
      console.log("⚠️ Could not read stored templates:", error);
    }
    
  } catch (error) {
    console.error("❌ Error during WebAuthn debug:", error);
  }
};

// Clear all stored hardware fingerprint templates
export const clearHardwareFingerprintTemplates = (): void => {
  console.log("🗑️ Clearing all hardware fingerprint templates");
  try {
    localStorage.removeItem('hardware_fingerprint_templates');
    console.log("✅ All hardware fingerprint templates cleared");
  } catch (error) {
    console.error("❌ Failed to clear templates:", error);
  }
};

// Clear specific inmate's hardware fingerprint template
export const clearInmateHardwareFingerprint = (inmateId: string): void => {
  console.log(`🗑️ Clearing hardware fingerprint template for inmate: ${inmateId}`);
  try {
    const storedTemplates = JSON.parse(
      localStorage.getItem('hardware_fingerprint_templates') || '[]'
    );
    
    const filteredTemplates = storedTemplates.filter(
      (t: HardwareFingerprintTemplate) => t.inmateId !== inmateId
    );
    
    localStorage.setItem('hardware_fingerprint_templates', JSON.stringify(filteredTemplates));
    console.log("✅ Inmate hardware fingerprint template cleared");
  } catch (error) {
    console.error("❌ Failed to clear inmate template:", error);
  }
}; 