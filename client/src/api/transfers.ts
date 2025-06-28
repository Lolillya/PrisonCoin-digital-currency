export interface TransferFundsRequest {
  toAddress: string;
  amount: number;
  reason: string;
}

export interface TransferFundsResponse {
  message: string;
  transactionHash: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  reason: string;
  timestamp: string;
}

export interface TreasuryBalanceResponse {
  balance: string;
  balanceInEth: string;
  message: string;
}

export const transferFunds = async (request: TransferFundsRequest): Promise<TransferFundsResponse> => {
  try {
    console.log("💰 Initiating fund transfer:", request);

    const res = await fetch("http://localhost:5266/api/inmate/transfer-eth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
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
      throw new Error(`Transfer failed: ${res.status} - ${responseText}`);
    }
  } catch (error) {
    console.error("Fund transfer failed:", error);
    throw error;
  }
};

export const getTreasuryBalance = async (): Promise<TreasuryBalanceResponse> => {
  try {
    const res = await fetch("http://localhost:5266/api/inmate/contract-eth-balance", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const responseText = await res.text();
    console.log("Raw treasury balance response:", responseText);

    if (res.ok) {
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        throw new Error(`Server returned invalid JSON: ${responseText}`);
      }
    } else {
      throw new Error(`Failed to get treasury balance: ${res.status} - ${responseText}`);
    }
  } catch (error) {
    console.error("Failed to get treasury balance:", error);
    throw error;
  }
};

export const validateEthAddress = (address: string): boolean => {
  // Basic Ethereum address validation
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(address);
};

export const validateAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 1000; // Reasonable limits
}; 