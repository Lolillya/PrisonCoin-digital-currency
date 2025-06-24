import { useState } from "react";


interface initialData {
    // STEP 1
    firstName?: string;
    lastName?: string;
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

export const useRegisterPageInmateData = () => {
    const [inmateData, setInmateData] = useState<initialData>(initialData);

    const updateInmateData = (newData: Partial<initialData>) => {
        setInmateData((prevData) => ({
            ...prevData,
            ...newData,
        }));
    };

    return {
        inmateData,
        updateInmateData,
    };
};

