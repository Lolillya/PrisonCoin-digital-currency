import { FingerprintIcon, LeftArrowIcon } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useRegisterSteps } from "@/hooks/register-page/register-page-steps.query";
import React, { useState } from "react";
import { CheckIcon } from "@/components/icons/icons";

export const RegisterInputs = () => {
  const { updateStep, steps } = useRegisterSteps();

  const handleContinue = (
    e: React.MouseEvent<HTMLButtonElement>,
    stepId: number
  ) => {
    e.preventDefault();
    updateStep(stepId);
  };

  const renderCurrentStep = () => {
    if (
      steps.step1 &&
      steps.step2 &&
      steps.step3 &&
      steps.step4 &&
      steps.step5
    ) {
      return <RegisterComplete />;
    }
    if (!steps.step1) {
      return <RegisterStep1 onContinue={(e) => handleContinue(e, 1)} />;
    }
    if (!steps.step2) {
      return <RegisterStep2 onContinue={(e) => handleContinue(e, 2)} />;
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
}: {
  onContinue: (e: React.MouseEvent<HTMLButtonElement>) => void;
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

          {/* <Button type="button" className="w-f">
            <LeftArrowIcon />
            <span>Back</span>
          </Button> */}

          <h2>Personal Information</h2>
        </div>

        <div className="flex flex-col gap-4">
          {/* inmate fullname */}
          <div className="flex flex-col relative group">
            <label className="absolute ml-4 text-white/80 text-sm mt-2 transition-all duration-200 group-focus-within:text-[0.625rem]">
              Full Name
            </label>
            <Input placeholder="John Doe" required />
          </div>

          {/* inmate auto-generated inmate number */}
          <div className="flex flex-col relative group">
            <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-[0.625rem]">
              In-mate No. (auto-generated)
            </label>
            <Input placeholder="#12345" required />
          </div>

          {/* inmate address */}
          <div className="flex flex-col relative group">
            <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-[0.625rem]">
              Address
            </label>
            <Input placeholder="Full Address" required />
          </div>

          {/* inmate height */}
          <div className="flex gap-4 w-full">
            <div className="flex flex-col relative group w-full">
              <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-[0.625rem]">
                Height
              </label>
              <Input placeholder="in inches" required />
            </div>

            {/* inmate weight */}
            <div className="flex flex-col relative group w-full">
              <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-[0.625rem]">
                Weight
              </label>
              <Input placeholder="in kg" required />
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
}: {
  onContinue: (e: React.MouseEvent<HTMLButtonElement>) => void;
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
            <Input placeholder="John Doe" required />
          </div>

          {/* arrest date */}
          <div className="flex gap-4 items-center w-full">
            {/* arrest date in mm/dd/yy */}
            <div className="group relative w-full">
              <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
                Arrest Date
              </label>
              <Input type="date" className="w-full" required />
            </div>

            {/* arrest time */}
            <div className="group relative w-full">
              <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
                Time of Arrest
              </label>
              <Input type="time" className="w-full" required />
            </div>
          </div>

          {/* arrest location */}
          <div className="flex flex-col relative group">
            <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
              Location of Arrest
            </label>
            <Input placeholder="John Doe" required />
          </div>

          {/* crime description */}
          <div className="flex flex-col relative group">
            <label className="absolute ml-4 text-white/80 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
              Charges / Description of Crime
            </label>
            <Input placeholder="John Doe" required />
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
              This step securely links the inmate's identity to their digital
              profile using a biometric fingerprint scan. The fingerprint will
              be encrypted and stored for future authentication during purchases
              and transactions.
            </p>
          </div>

          <div className="text-center flex flex-col">
            <p className="text-sm text-text/70 mb-2">
              Start the scanning process below.
            </p>
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
          Please review the information provided before finalizing the
          registration.
        </p>

        <div className="overflow-y-auto pr-2">
          {/* Display summary of all steps here */}
        </div>

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
          Thank you for registering. The inmate's account has been created
          successfully and is now ready to use the system.
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
