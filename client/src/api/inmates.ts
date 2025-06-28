export async function registerInmate(data: any) {
  try {
    console.log("🚀 Starting inmate registration process...");
    console.log("📋 Registration data:", data);

    // Step 1: Register in database
    console.log("📊 Step 1: Registering in database...");
    const dbRes = await fetch("http://localhost:5266/api/inmatesdb/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    console.log("Database response status:", dbRes.status);
    
    if (!dbRes.ok) {
      const dbErrorText = await dbRes.text();
      console.error("Database registration failed:", dbErrorText);
      throw new Error(`Database registration failed: ${dbRes.status} - ${dbErrorText}`);
    }

    const dbResponse = await dbRes.json();
    console.log("✅ Database registration successful:", dbResponse);

    // Step 2: Register on blockchain
    console.log("⛓️ Step 2: Registering on blockchain...");
    const blockchainData = {
      InmateNumber: data.InmateNumber,
      fullName: data.FullName,
      walletAddress: data.WalletAddress,
      height: data.Height,
      weight: data.Weight,
      arrestingOfficer: data.ArrestingOfficer,
      arrestDate: data.ArrestDate,
      arrestTime: data.ArrestTime,
      arrestLocation: data.ArrestLocation,
      charges: data.Charges,
      fingerprintHash: data.FingerprintHash
    };

    const blockchainRes = await fetch("http://localhost:5266/api/inmate/register-inmate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blockchainData),
    });

    console.log("Blockchain response status:", blockchainRes.status);
    
    if (!blockchainRes.ok) {
      const blockchainErrorText = await blockchainRes.text();
      console.error("Blockchain registration failed:", blockchainErrorText);
      throw new Error(`Blockchain registration failed: ${blockchainRes.status} - ${blockchainErrorText}`);
    }

    const blockchainResponse = await blockchainRes.json();
    console.log("✅ Blockchain registration successful:", blockchainResponse);

    // Return combined success response
    return {
      success: true,
      message: "Inmate registered successfully in both database and blockchain",
      database: dbResponse,
      blockchain: blockchainResponse,
      transactionHash: blockchainResponse.transactionHash
    };

  } catch (error) {
    console.error("❌ Registration process failed:", error);
    throw error;
  }
}

export async function registerInmateOnBlockchain(data: any) {
  try {
    console.log("⛓️ Registering inmate on blockchain:", data);

    const res = await fetch("http://localhost:5266/api/inmate/register-inmate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    console.log("Blockchain response status:", res.status);
    
    const responseText = await res.text();
    console.log("Raw blockchain response:", responseText);

    if (res.ok) {
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse blockchain JSON response:", parseError);
        throw new Error(`Blockchain server returned invalid JSON: ${responseText}`);
      }
    } else {
      throw new Error(`Blockchain registration failed: ${res.status} - ${responseText}`);
    }
  } catch (error) {
    console.error("Blockchain registration failed:", error);
    throw error;
  }
}

export async function getInmates() {
  try {
    const res = await fetch("http://localhost:5266/api/inmate/all-inmates/", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    console.log("Response status:", res.status);
    console.log("Response headers:", Object.fromEntries(res.headers.entries()));

    const responseText = await res.text();
    console.log("Raw response:", responseText);

    if (res.ok) {
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        throw new Error(`Server returned invalid JSON: ${responseText}`);
      }
    } else {
      // Server returned an error status
      throw new Error(`Server error ${res.status}: ${responseText}`);
    }
  } catch (error) {
    console.error("Error fetching inmates:", error);
    throw error;
  }
}

export const getWalletBalance = async (walletAddress: string) => {
  try {
    const res = await fetch("http://localhost:5266/api/inmate/eth-balance/" + walletAddress, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const responseText = await res.text();
    console.log("Raw response:", responseText);

    if (res.ok) {
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        throw new Error(`Server returned invalid JSON: ${responseText}`);
      }
    } else {
      // Server returned an error status
      throw new Error(`Server error ${res.status}: ${responseText}`);
    }
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    throw error;
  }
};

export const getAllBlockchainTransactions = async () => {
  try {
    const res = await fetch("http://localhost:5266/api/inmate/all-blockchain-transactions/", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const responseText = await res.text();
    console.log("Raw response:", responseText);

    if (res.ok) {
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        throw new Error(`Server returned invalid JSON: ${responseText}`);
      }
    } else {
      // Server returned an error status
      throw new Error(`Server error ${res.status}: ${responseText}`);
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};
