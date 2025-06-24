import { FingerprintIcon, LeftArrowIcon } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useRegisterSteps } from "@/hooks/register-page/register-page-steps.query";
import React, { useState, useEffect } from "react";
import { CheckIcon } from "@/components/icons/icons";
import { useRegisterPageInmateData } from "@/hooks/register-page/register-page-inmate-data";

export const RegisterInputs = () => {
  const { updateStep, steps } = useRegisterSteps();
  const { inmateData, updateInmateData } = useRegisterPageInmateData();

  console.log(inmateData);

  // Global state for form fields, initialized from inmateData
  // STEP 1
  const [firstName, setFirstName] = useState(inmateData.firstName || "");
  const [lastName, setLastName] = useState(inmateData.lastName || "");
  const [inmateNo, setInmateNo] = useState(inmateData.inmateId || "");
  const [address, setAddress] = useState(inmateData.address || "");
  const [height, setHeight] = useState(inmateData.height || "");
  const [weight, setWeight] = useState(inmateData.weight || "");

  // STEP 2
  const [arrestingOfficer, setArrestingOfficer] = useState(inmateData.arrestingOfficer || "");
  const [arrestDate, setArrestDate] = useState(inmateData.arrestDate || "");
  const [timeOfArrest, setTimeOfArrest] = useState(inmateData.arrestTime || "");
  const [arrestLocation, setArrestLocation] = useState(inmateData.arrestLocation || "");
  const [charges, setCharges] = useState(inmateData.charges || "");

  6;

  // Optional: keep local state in sync with inmateData if it changes externally
  // useEffect(() => {
  //   setFullName(inmateData.fullName || "");
  //   setInmateNo(inmateData.inmateId || "");
  //   setAddress(inmateData.address || "");
  //   setHeight(inmateData.height || "");
  //   setWeight(inmateData.weight || "");
  // }, [inmateData]);

  // Global handleContinue
  const handleContinue = (e: React.MouseEvent<HTMLButtonElement>, stepId: number) => {
    e.preventDefault();
    // Update global inmateData on continue (for step 1)
    if (stepId === 1) {
      updateInmateData({
        ...inmateData,
        firstName,
        lastName,
        inmateId: inmateNo,
        address,
        height,
        weight,
      });
    }

    if (stepId === 2) {
      updateInmateData({
        ...inmateData,
        arrestingOfficer,
        arrestDate,
        arrestTime: timeOfArrest,
        arrestLocation,
        charges,
      });
    }
    updateStep(stepId);
  };

  const renderCurrentStep = () => {
    if (steps.step1 && steps.step2 && steps.step3 && steps.step4 && steps.step5) {
      return <RegisterComplete />;
    }
    if (!steps.step1) {
      return (
        <RegisterStep1
          onContinue={(e) => handleContinue(e, 1)}
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          inmateNo={inmateNo}
          setInmateNo={setInmateNo}
          address={address}
          setAddress={setAddress}
          height={height}
          setHeight={setHeight}
          weight={weight}
          setWeight={setWeight}
        />
      );
    }
    if (!steps.step2) {
      return (
        <RegisterStep2
          onContinue={(e) => handleContinue(e, 2)}
          arrestingOfficer={arrestingOfficer}
          setArrestingOfficer={setArrestingOfficer}
          arrestDate={arrestDate}
          setArrestDate={setArrestDate}
          timeOfArrest={timeOfArrest}
          setTimeOfArrest={setTimeOfArrest}
          arrestLocation={arrestLocation}
          setArrestLocation={setArrestLocation}
          charges={charges}
          setCharges={setCharges}
        />
      );
    }
    if (!steps.step3) {
      return <RegisterStep3 onContinue={(e) => handleContinue(e, 3)} />;
    }
    if (!steps.step4) {
      return <RegisterStep4 onContinue={(e) => handleContinue(e, 4)} />;
    }
    if (!steps.step5) {
      return <RegisterStep5 onContinue={(e) => handleContinue(e, 5)} />;
    }
    return null;
  };

  return <form className="flex-1 flex h-full">{renderCurrentStep()}</form>;
};

const RegisterStep1 = ({
  onContinue,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  inmateNo,
  setInmateNo,
  address,
  setAddress,
  height,
  setHeight,
  weight,
  setWeight,
}: {
  onContinue: (e: React.MouseEvent<HTMLButtonElement>) => void;
  firstName: string;
  setFirstName: React.Dispatch<React.SetStateAction<string>>;
  lastName: string;
  setLastName: React.Dispatch<React.SetStateAction<string>>;
  inmateNo: string;
  setInmateNo: React.Dispatch<React.SetStateAction<string>>;
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  height: string;
  setHeight: React.Dispatch<React.SetStateAction<string>>;
  weight: string;
  setWeight: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div className="flex-1 flex mt-4">
      <div className="flex flex-col gap-4 w-full justify-between">
        {/* HEADER */}
        <div className="w-full flex justify-between items-center">
          <div className="p-4 bg-primary text-white rounded-lg flex items-center gap-1">
            <LeftArrowIcon />
            <span>Back</span>
          </div>

          <h2>Personal Information</h2>
        </div>

        <div className="flex flex-col gap-4">
          {/* inmate fullname */}
          <div className="flex gap-4 w-full">
            <div className="flex flex-col relative group w-full">
              <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-[0.625rem]">
                Firstname
              </label>
              <Input
                placeholder="John"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="flex flex-col relative group w-full">
              <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-[0.625rem]">
                Lastname
              </label>
              <Input
                placeholder="Doe"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          {/* inmate auto-generated inmate number */}
          <div className="flex flex-col relative group">
            <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-[0.625rem]">
              In-mate No. (auto-generated)
            </label>
            <Input
              placeholder="#12345"
              required
              value={inmateNo}
              onChange={(e) => setInmateNo(e.target.value)}
              disabled // If this should not be editable, keep disabled
            />
          </div>

          {/* inmate address */}
          <div className="flex flex-col relative group">
            <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-[0.625rem]">
              Address
            </label>
            <Input
              placeholder="Full Address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* inmate height and weight */}
          <div className="flex gap-4 w-full">
            <div className="flex flex-col relative group w-full">
              <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-[0.625rem]">
                Height
              </label>
              <Input
                placeholder="in inches"
                required
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
            <div className="flex flex-col relative group w-full">
              <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-[0.625rem]">
                Weight
              </label>
              <Input
                placeholder="in kg"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div>
          <Button type="submit" onClick={onContinue}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

const RegisterStep2 = ({
  onContinue,
  arrestingOfficer,
  setArrestingOfficer,
  arrestDate,
  setArrestDate,
  timeOfArrest,
  setTimeOfArrest,
  arrestLocation,
  setArrestLocation,
  charges,
  setCharges,
}: {
  onContinue: (e: React.MouseEvent<HTMLButtonElement>) => void;
  arrestingOfficer: string;
  setArrestingOfficer: React.Dispatch<React.SetStateAction<string>>;
  arrestDate: string;
  setArrestDate: React.Dispatch<React.SetStateAction<string>>;
  timeOfArrest: string;
  setTimeOfArrest: React.Dispatch<React.SetStateAction<string>>;
  arrestLocation: string;
  setArrestLocation: React.Dispatch<React.SetStateAction<string>>;
  charges: string;
  setCharges: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
    <div className="flex-1 flex">
      <div className="flex flex-col gap-4 w-full justify-between mt-4">
        {/* HEADER */}
        <div className="w-full flex justify-between items-center">
          <div className="p-4 bg-primary text-white rounded-lg flex items-center gap-1">
            <LeftArrowIcon />
            <span>Back</span>
          </div>
          <h2>Arrest Information</h2>
        </div>

        <div className="flex flex-col gap-4">
          {/* arresting officer */}
          <div className="flex flex-col relative group">
            <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
              Arresting Officer
            </label>
            <Input
              placeholder="John Doe"
              required
              value={arrestingOfficer}
              onChange={(e) => setArrestingOfficer(e.target.value)}
            />
          </div>

          {/* arrest date */}
          <div className="flex gap-4 items-center w-full">
            {/* arrest date in mm/dd/yy */}
            <div className="group relative w-full">
              <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
                Arrest Date
              </label>
              <Input
                type="date"
                className="w-full"
                required
                value={arrestDate}
                onChange={(e) => setArrestDate(e.target.value)}
              />
            </div>

            {/* arrest time */}
            <div className="group relative w-full">
              <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
                Time of Arrest
              </label>
              <Input
                type="time"
                className="w-full"
                required
                value={timeOfArrest}
                onChange={(e) => setTimeOfArrest(e.target.value)}
              />
            </div>
          </div>

          {/* arrest location */}
          <div className="flex flex-col relative group">
            <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
              Location of Arrest
            </label>
            <Input
              placeholder="John Doe"
              required
              value={arrestLocation}
              onChange={(e) => setArrestLocation(e.target.value)}
            />
          </div>

          {/* crime description */}
          <div className="flex flex-col relative group">
            <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
              Charges / Description of Crime
            </label>
            <Input
              placeholder="John Doe"
              required
              value={charges}
              onChange={(e) => setCharges(e.target.value)}
            />
          </div>

          {/* inmate image */}
          <div className="flex flex-col relative group">
            <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
              Image
            </label>
            <Input type="file" />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div>
          <Button type="submit" onClick={onContinue}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

const RegisterStep3 = ({
  onContinue,
}: {
  onContinue: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScanComplete, setIsScanComplete] = useState(true);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isScanComplete) {
      setIsModalOpen(true);
    } else {
      onContinue(e);
    }
  };

  return (
    <>
      {isModalOpen && <Modal setIsModalOpen={setIsModalOpen} />}
      <div className="flex-1 flex flex-col pt-5">
        <div className="flex items-center justify-between">
          <div className="p-4 bg-primary text-white rounded-lg flex items-center gap-1">
            <LeftArrowIcon />
            <span>Back</span>
          </div>
          <h2>Biometric Entrollment</h2>
        </div>

        <div className="flex flex-col gap-4 w-full flex-1 justify-between pt-5">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="text-white relative group bg-primary flex w-fit p-4 rounded-full shadow-lg">
              <FingerprintIcon width={150} height={150} />
            </div>
            <h3>Register Inmate fingerprint</h3>
            <p className="text-center text-sm text-text/70 max-w-md mt-2">
              This step securely links the inmate's identity to their digital profile using a
              biometric fingerprint scan. The fingerprint will be encrypted and stored for future
              authentication during purchases and transactions.
            </p>
          </div>

          <div className="text-center flex flex-col">
            <p className="text-sm text-text/70 mb-2">Start the scanning process below.</p>
            <Button onClick={handleButtonClick}>
              {isScanComplete ? "Continue" : "Scan Fingerprint"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

const RegisterStep4 = ({
  onContinue,
}: {
  onContinue: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  return (
    <div className="flex-1 flex flex-col pt-5">
      <div className="flex items-center justify-between">
        <div className="p-4 bg-primary text-white rounded-lg flex items-center gap-1">
          <LeftArrowIcon />
          <span>Back</span>
        </div>
        <h2>Wallet & Token Assignment</h2>
      </div>

      <div className="flex flex-col gap-6 mt-8 flex-1">
        <div className="flex-1 flex flex-col justify-between gap-4">
          <div className="flex gap-4 items-center">
            <div className="flex gap-2 items-center">
              <label className="text-text/70">Status:</label>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm">
                PENDING
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col relative group">
              <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
                Wallet Address
              </label>
              <Input placeholder="0x..." required />
            </div>

            {/* <div className="flex flex-col relative group">
              <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
                Private Key
              </label>
              <Input type="password" placeholder="Enter private key" required />
            </div> */}

            <div className="flex gap-4">
              <div className="flex flex-col relative group w-full">
                <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
                  Initial Token Balance
                </label>
                <Input type="number" placeholder="0" required />
              </div>

              <div className="flex flex-col relative group w-full">
                <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
                  Daily Spending Limit
                </label>
                <Input type="number" placeholder="0" required />
              </div>
            </div>

            {/* <div className="flex flex-col relative group">
              <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
                Transaction Pin
              </label>
              <Input
                type="password"
                placeholder="Enter 6-digit PIN"
                maxLength={6}
                required
              />
            </div> */}
          </div>

          <div className="mt-auto">
            <Button type="submit" onClick={onContinue}>
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RegisterStep5 = ({
  onContinue,
}: {
  onContinue: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  return (
    <div className="flex-1 flex flex-col pt-5">
      <div className="flex items-center justify-between">
        <div className="p-4 bg-primary text-white rounded-lg flex items-center gap-1">
          <LeftArrowIcon />
          <span>Back</span>
        </div>
        <h2>Register Confirmation</h2>
      </div>

      <div className="flex flex-col gap-6 mt-8 flex-1 justify-between">
        <p className="text-center text-text/70">
          Please review the information provided before finalizing the registration.
        </p>

        <div className="overflow-y-auto pr-2">{/* Display summary of all steps here */}</div>

        <div className="mt-4">
          <Button type="submit" onClick={onContinue}>
            Confirm Registration
          </Button>
        </div>
      </div>
    </div>
  );
};

const RegisterComplete = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 py-5">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-primary p-6 rounded-full text-white">
          <CheckIcon />
        </div>
        <h2 className="text-3xl font-bold">Registration Complete!</h2>
        <p className="text-white/70 text-center max-w-md">
          Thank you for registering. The inmate's account has been created successfully and is now
          ready to use the system.
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <div className="bg-accent/80 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Next Steps:</h3>
          <ul className="list-disc list-inside text-white/70 space-y-2">
            <li>Inmate can now access their account</li>
            <li>Tokens have been assigned to their wallet</li>
            <li>Biometric authentication is set up</li>
          </ul>
        </div>

        <Button className="w-full">Go to Dashboard</Button>
      </div>
    </div>
  );
};
