export async function registerInmate(data: any) {
  try {
    console.log("Sending data to server:", data);

    const res = await fetch("http://localhost:5266/api/inmatesdb/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    console.log("Response status:", res.status);
    console.log("Response headers:", Object.fromEntries(res.headers.entries()));

    // Get the raw response text first
    const responseText = await res.text();
    console.log("Raw response:", responseText);

    // Try to parse as JSON
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
    console.error("API call failed:", error);
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
