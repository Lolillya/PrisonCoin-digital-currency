export interface MarketItem {
  id: number;
  name: string;
  description: string;
  costInEth: number;
  category: string;
}

export interface AvailableItemsResponse {
  items: MarketItem[];
  message: string;
  totalItems: number;
  paymentMethod: string;
}

export interface PurchaseItemRequest {
  inmateAddress: string;
  item: string;
  amountInEth: number;
}

export interface PurchaseItemResponse {
  message: string;
  transactionHash: string;
  inmateAddress: string;
  item: string;
  amountInEth: number;
  amountInWei: string;
  accountBalance: string;
  timestamp: string;
}

export interface InmateSearchResult {
  id: string;
  inmateNumber: string;
  fullName: string;
  walletAddress: string;
  fingerprintHash: string;
  initialBalance: number;
  dailySpendingLimit: number;
}

export const getAvailableItems = async (): Promise<AvailableItemsResponse> => {
  try {
    const res = await fetch("http://localhost:5266/api/inmate/available-items", {
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
      throw new Error(`Server error ${res.status}: ${responseText}`);
    }
  } catch (error) {
    console.error("Error fetching available items:", error);
    throw error;
  }
};

export const purchaseItemWithEth = async (request: PurchaseItemRequest): Promise<PurchaseItemResponse> => {
  try {
    const res = await fetch("http://localhost:5266/api/inmate/purchase-item-eth", {
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
      throw new Error(`Server error ${res.status}: ${responseText}`);
    }
  } catch (error) {
    console.error("Error purchasing item:", error);
    throw error;
  }
};

export const getItemPriceInEth = async (itemName: string): Promise<{ priceInEth: string; priceInWei: string }> => {
  try {
    const res = await fetch(`http://localhost:5266/api/inmate/item-price-eth/${encodeURIComponent(itemName)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const responseText = await res.text();
    console.log("Raw response:", responseText);

    if (res.ok) {
      try {
        const data = JSON.parse(responseText);
        return {
          priceInEth: data.priceInEth,
          priceInWei: data.priceInWei
        };
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        throw new Error(`Server returned invalid JSON: ${responseText}`);
      }
    } else {
      throw new Error(`Server error ${res.status}: ${responseText}`);
    }
  } catch (error) {
    console.error("Error fetching item price:", error);
    throw error;
  }
};

export const searchInmateByFingerprint = async (fingerprintHash: string): Promise<InmateSearchResult | null> => {
  try {
    const res = await fetch(`http://localhost:5266/api/inmate/search-by-fingerprint/${encodeURIComponent(fingerprintHash)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const responseText = await res.text();
    console.log("Raw response:", responseText);

    if (res.ok) {
      try {
        const data = JSON.parse(responseText);
        return data.inmate || null;
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        throw new Error(`Server returned invalid JSON: ${responseText}`);
      }
    } else if (res.status === 404) {
      // Inmate not found
      return null;
    } else {
      throw new Error(`Server error ${res.status}: ${responseText}`);
    }
  } catch (error) {
    console.error("Error searching inmate by fingerprint:", error);
    throw error;
  }
}; 