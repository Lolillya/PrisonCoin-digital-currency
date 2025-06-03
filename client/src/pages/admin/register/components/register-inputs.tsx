import { FingerprintIcon, LeftArrowIcon } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useRegisterSteps } from "@/hooks/register-page/register-page-steps.query";
import { useState } from "react";

export const RegisterInputs = () => {
  const { updateStep, steps } = useRegisterSteps();

  const handleContinue = (
    e: React.MouseEvent<HTMLButtonElement>,
    stepId: number
  ) => {
    e.preventDefault();
    updateStep(stepId);
  };

  console.log("Step completed:", steps);
  return (
    <form className="flex-1 flex h-full">
      {/* STEP 1 */}
      {/* {!steps.step1 && <RegisterStep1 onContinue={(e) => handleContinue(e, 1)} /> } */}
      {/* STEP 2 */}
      {/* {!(!steps.step1 && !steps.step1) && <RegisterStep2 onContinue={(e) => handleContinue(e, 2)} />} */}
      <RegisterStep3 onContinue={(e) => handleContinue(e, 3)} />
    </form>
  );
};

const RegisterStep1 = ({
  onContinue,
}: {
  onContinue: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  return (
    <div className="w-full h-full flex m-auto">
      <div className="flex flex-col gap-4 w-full">
        <div className="w-full flex justify-between items-center">
          <div className="p-4 bg-primary text-text rounded-lg flex items-center gap-1">
            <LeftArrowIcon />
            <span>Back</span>
          </div>
          <h2>Personal Information</h2>
        </div>
        <div className="flex flex-col relative group">
          <label className="absolute ml-4 text-secondary/70 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
            Full Name
          </label>
          <Input placeholder="John Doe" required />
        </div>

        <div className="flex flex-col relative group">
          <label className="absolute ml-4 text-secondary/70 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
            In-mate No. (auto-generated)
          </label>
          <Input placeholder="#12345" required />
        </div>

        <div className="flex flex-col relative group">
          <label className="absolute ml-4 text-secondary/70 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
            Address
          </label>
          <Input placeholder="Full Address" required />
        </div>

        <div className="flex gap-4 w-full">
          <div className="flex flex-col relative group w-full">
            <label className="absolute ml-4 text-secondary/70 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
              Height
            </label>
            <Input placeholder="in inches" required />
          </div>

          <div className="flex flex-col relative group w-full">
            <label className="absolute ml-4 text-secondary/70 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
              Weight
            </label>
            <Input placeholder="in kg" required />
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
    <div className="w-full h-full flex m-auto">
      <div className="flex flex-col gap-4 w-full">
        <div className="w-full flex justify-between items-center">
          <div className="p-4 bg-primary text-text rounded-lg flex items-center gap-1">
            <LeftArrowIcon />
            <span>Back</span>
          </div>
          <h2>Arrest Information</h2>
        </div>
        <div className="flex flex-col relative group">
          <label className="absolute ml-4 text-secondary/70 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
            Arresting Officer
          </label>
          <Input placeholder="John Doe" required />
        </div>

        <div className="flex gap-4 items-center w-full">
          <div className="group relative w-full">
            <label className="absolute ml-4 text-secondary/70 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
              Arrest Date
            </label>
            <Input type="date" className="w-full" required />
          </div>

          <div className="group relative w-full">
            <label className="absolute ml-4 text-secondary/70 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
              Time of Arrest
            </label>
            <Input type="time" className="w-full" required />
          </div>
        </div>

        <div className="flex flex-col relative group">
          <label className="absolute ml-4 text-secondary/70 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
            Location of Arrest
          </label>
          <Input placeholder="John Doe" required />
        </div>

        <div className="flex flex-col relative group">
          <label className="absolute ml-4 text-secondary/70 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
            Charges / Description of Crime
          </label>
          <Input placeholder="John Doe" required />
        </div>

        <div className="flex flex-col relative group">
          <label className="absolute ml-4 text-secondary/70 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
            Image
          </label>
          <Input type="file" />
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

const RegisterStep3 = ({
  onContinue,
}: {
  onContinue: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScanComplete, setIsScanComplete] = useState(true);
  return (
    <>
      {isModalOpen && <Modal setIsModalOpen={setIsModalOpen} />}
      <div className="flex-1 flex flex-col py-5">
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
              <FingerprintIcon width={200} height={200} />
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
            <Button onClick={() => setIsModalOpen(!isModalOpen)}>
              {isScanComplete ? "Continue" : "Scan Fingerprint"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
