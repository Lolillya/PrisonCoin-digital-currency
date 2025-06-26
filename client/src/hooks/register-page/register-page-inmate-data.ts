import { useState, useEffect } from "react";

interface initialData {
  // STEP 1
  firstName: string;
  lastName: string;
  inmateId: string;
  address: string;
  height: string;
  weight: string;

  // STEP 2
  arrestingOfficer: string;
  arrestDate: string;
  arrestTime: string;
  arrestLocation: string;
  charges: string;

  // STEP 3
  fingerprintData: string;

  // STEP 4
  walletAddress: string;
  initialBalance: number;
  spendingLimit: number;

  // STEP 5
  isValidated: boolean;
}

const initialData: initialData = {
  // STEP 1
  firstName: "",
  lastName: "",
  inmateId: "",
  address: "",
  height: "",
  weight: "",

  // STEP 2
  arrestingOfficer: "",
  arrestDate: "",
  arrestTime: "",
  arrestLocation: "",
  charges: "",

  // STEP 3
  fingerprintData: "",

  // STEP 4
  walletAddress: "",
  initialBalance: 0,
  spendingLimit: 0,

  // STEP 5
  isValidated: false,
};

// Helper functions for localStorage
const getStoredInmateData = (): initialData => {
  try {
    const stored = localStorage.getItem("registerInmateData");
    return stored ? JSON.parse(stored) : initialData;
  } catch (error) {
    console.error("Error reading inmate data from localStorage:", error);
    return initialData;
  }
};

const setStoredInmateData = (data: initialData): void => {
  try {
    localStorage.setItem("registerInmateData", JSON.stringify(data));
  } catch (error) {
    console.error("Error writing inmate data to localStorage:", error);
  }
};

export const useRegisterPageInmateData = () => {
  const [inmateData, setInmateData] = useState<initialData>(getStoredInmateData());

  // Load data from localStorage on mount
  useEffect(() => {
    const storedData = getStoredInmateData();
    setInmateData(storedData);
  }, []);

  const updateInmateData = (newData: Partial<initialData>) => {
    const updatedData = {
      ...inmateData,
      ...newData,
    };
    setInmateData(updatedData);
    setStoredInmateData(updatedData);
  };

  // Function to reset inmate data (useful for starting over)
  const resetInmateData = () => {
    setInmateData(initialData);
    setStoredInmateData(initialData);
  };

  return {
    inmateData,
    updateInmateData,
    resetInmateData,
  };
};
