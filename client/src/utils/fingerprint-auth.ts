// Fingerprint Authentication Utilities
// This module provides functions for fingerprint registration, encryption, and authentication

export interface FingerprintTemplate {
  id: string;
  template: string;
  encryptedData: string;
  createdAt: string;
  inmateId: string;
}

export interface FingerprintScanResult {
  success: boolean;
  template?: string;
  error?: string;
  scanQuality?: number;
}

// Generate a unique fingerprint ID
export const generateFingerprintId = (): string => {
  return `fp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Simulate fingerprint scanning (in a real app, this would interface with hardware)
export const simulateFingerprintScan = (): Promise<FingerprintScanResult> => {
  return new Promise((resolve) => {
    // Simulate scanning delay
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        // Generate a realistic fingerprint template (base64 encoded)
        const template = btoa(
          Array.from({ length: 256 }, () => Math.floor(Math.random() * 256))
            .map(byte => String.fromCharCode(byte))
            .join('')
        );
        
        const scanQuality = Math.floor(Math.random() * 30) + 70; // 70-100 quality
        
        resolve({
          success: true,
          template,
          scanQuality
        });
      } else {
        resolve({
          success: false,
          error: "Fingerprint scan failed. Please try again."
        });
      }
    }, 2000); // 2 second delay to simulate scanning
  });
};

// Encrypt fingerprint template using Web Crypto API
export const encryptFingerprintTemplate = async (
  template: string,
  inmateId: string
): Promise<string> => {
  try {
    // Generate a key from inmate ID (in production, use a proper key derivation function)
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(inmateId + "_secret_salt"),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: encoder.encode("fingerprint_salt"),
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt"]
    );
    
    // Generate IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the template
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoder.encode(template)
    );
    
    // Combine IV and encrypted data
    const encryptedArray = new Uint8Array(encrypted);
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv);
    combined.set(encryptedArray, iv.length);
    
    // Return as base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to encrypt fingerprint template");
  }
};

// Decrypt fingerprint template
export const decryptFingerprintTemplate = async (
  encryptedData: string,
  inmateId: string
): Promise<string> => {
  try {
    // Decode from base64
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    // Generate the same key
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(inmateId + "_secret_salt"),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: encoder.encode("fingerprint_salt"),
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["decrypt"]
    );
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt fingerprint template");
  }
};

// Register a new fingerprint
export const registerFingerprint = async (
  inmateId: string
): Promise<FingerprintTemplate> => {
  console.log("🔐 Starting fingerprint registration for inmate:", inmateId);
  
  // Simulate fingerprint scanning
  const scanResult = await simulateFingerprintScan();
  
  if (!scanResult.success || !scanResult.template) {
    throw new Error(scanResult.error || "Fingerprint scan failed");
  }
  
  console.log("✅ Fingerprint scan completed successfully");
  console.log("📊 Scan quality:", scanResult.scanQuality);
  
  // Encrypt the fingerprint template
  const encryptedData = await encryptFingerprintTemplate(scanResult.template, inmateId);
  
  console.log("🔒 Fingerprint template encrypted successfully");
  
  // Create fingerprint template object
  const fingerprintTemplate: FingerprintTemplate = {
    id: generateFingerprintId(),
    template: scanResult.template,
    encryptedData,
    createdAt: new Date().toISOString(),
    inmateId
  };
  
  console.log("📝 Fingerprint template created:", {
    id: fingerprintTemplate.id,
    inmateId: fingerprintTemplate.inmateId,
    createdAt: fingerprintTemplate.createdAt,
    templateLength: fingerprintTemplate.template.length,
    encryptedLength: fingerprintTemplate.encryptedData.length
  });
  
  return fingerprintTemplate;
};

// Verify fingerprint against stored template
export const verifyFingerprint = async (
  storedTemplate: FingerprintTemplate,
  inmateId: string
): Promise<boolean> => {
  console.log("🔍 Verifying fingerprint for inmate:", inmateId);
  
  try {
    // Simulate new scan for verification
    const scanResult = await simulateFingerprintScan();
    
    if (!scanResult.success || !scanResult.template) {
      console.log("❌ Verification scan failed");
      return false;
    }
    
    console.log("✅ Verification scan completed");
    
    // Decrypt stored template
    const decryptedStoredTemplate = await decryptFingerprintTemplate(
      storedTemplate.encryptedData,
      inmateId
    );
    
    console.log("🔓 Stored template decrypted successfully");
    
    // In a real implementation, you would use a fingerprint matching algorithm
    // For now, we'll simulate matching with some tolerance
    const matchThreshold = 0.85; // 85% similarity threshold
    const similarity = calculateTemplateSimilarity(
      decryptedStoredTemplate,
      scanResult.template
    );
    
    console.log("📊 Template similarity:", similarity);
    console.log("🎯 Match threshold:", matchThreshold);
    
    const isMatch = similarity >= matchThreshold;
    
    if (isMatch) {
      console.log("✅ Fingerprint verification successful");
    } else {
      console.log("❌ Fingerprint verification failed");
    }
    
    return isMatch;
  } catch (error) {
    console.error("❌ Fingerprint verification error:", error);
    return false;
  }
};

// Calculate similarity between two fingerprint templates
// This is a simplified implementation - real systems use sophisticated algorithms
const calculateTemplateSimilarity = (template1: string, template2: string): number => {
  // Simple similarity calculation based on character differences
  // In reality, this would be much more complex
  const maxLength = Math.max(template1.length, template2.length);
  let differences = 0;
  
  for (let i = 0; i < maxLength; i++) {
    if (template1[i] !== template2[i]) {
      differences++;
    }
  }
  
  const similarity = 1 - (differences / maxLength);
  
  // Add some randomness to simulate real fingerprint variations
  const randomVariation = (Math.random() - 0.5) * 0.1; // ±5% variation
  return Math.max(0, Math.min(1, similarity + randomVariation));
};

// Store fingerprint template (in a real app, this would go to a database)
export const storeFingerprintTemplate = (template: FingerprintTemplate): void => {
  console.log("💾 Storing fingerprint template in local storage");
  
  try {
    const storedTemplates = JSON.parse(
      localStorage.getItem('fingerprint_templates') || '[]'
    );
    
    // Remove any existing template for this inmate
    const filteredTemplates = storedTemplates.filter(
      (t: FingerprintTemplate) => t.inmateId !== template.inmateId
    );
    
    // Add new template
    filteredTemplates.push(template);
    
    localStorage.setItem('fingerprint_templates', JSON.stringify(filteredTemplates));
    
    console.log("✅ Fingerprint template stored successfully");
    console.log("📊 Total stored templates:", filteredTemplates.length);
  } catch (error) {
    console.error("❌ Failed to store fingerprint template:", error);
    throw error;
  }
};

// Retrieve fingerprint template
export const getFingerprintTemplate = (inmateId: string): FingerprintTemplate | null => {
  try {
    const storedTemplates = JSON.parse(
      localStorage.getItem('fingerprint_templates') || '[]'
    );
    
    const template = storedTemplates.find(
      (t: FingerprintTemplate) => t.inmateId === inmateId
    );
    
    if (template) {
      console.log("📋 Retrieved fingerprint template for inmate:", inmateId);
      return template;
    } else {
      console.log("❌ No fingerprint template found for inmate:", inmateId);
      return null;
    }
  } catch (error) {
    console.error("❌ Failed to retrieve fingerprint template:", error);
    return null;
  }
}; 