import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegisterSteps } from "@/hooks/register-page/register-page-steps.query";

export const RegisterInputs = () => {
  const { updateStep } = useRegisterSteps();

  const handleContinue = (e: React.FormEvent<HTMLFormElement>) => {
    updateStep(1); // This will mark step 1 as complete

    e.preventDefault();
    console.log("Continue button clicked");
  };

  return (
    <form onSubmit={handleContinue}>
      {/* STEP 1 */}
      {/* <div className="w-full h-full flex m-auto">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col relative group">
            <label className="absolute ml-4 text-secondary/70 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
              Full Name
            </label>
            <Input placeholder="John Doe" required/>
          </div>

          <div className="flex flex-col relative group">
            <label className="absolute ml-4 text-secondary/70 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
              In-mate No. (auto-generated)
            </label>
            <Input placeholder="#12345" required/>
          </div>

          <div className="flex flex-col relative group">
            <label className="absolute ml-4 text-secondary/70 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
              Address
            </label>
            <Input placeholder="Full Address" required/>
          </div>

          <div className="flex gap-4 w-full">
            <div className="flex flex-col relative group w-full">
              <label className="absolute ml-4 text-secondary/70 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
                Height
              </label>
              <Input placeholder="in inches" required/>
            </div>

            <div className="flex flex-col relative group w-full">
              <label className="absolute ml-4 text-secondary/70 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
                Weight
              </label>
              <Input placeholder="in kg" required/>
            </div>
          </div>
          <div>
            <Button type="submit">Continue</Button>
          </div>
        </div>
      </div> */}

      {/* STEP 2 */}
      <div className="w-full h-full flex m-auto">
        <div className="flex flex-col gap-4 w-full">
          <h2>Arrest Information</h2>
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
            <Button type="submit">Continue</Button>
          </div>
        </div>
      </div>
    </form>
  );
};
