import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const RegisterInputs = () => {
  return (
    <div className="w-full h-full flex m-auto">
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col relative group">
          <label className="absolute ml-4 text-secondary/70 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
            Full Name
          </label>
          <Input />
        </div>

        <div className="flex flex-col relative group">
          <label className="absolute ml-4 text-secondary/70 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
            In-mate No. (auto-generated)
          </label>
          <Input placeholder="#12345" />
        </div>

        <div className="flex flex-col relative group">
          <label className="absolute ml-4 text-secondary/70 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
            Address
          </label>
          <Input placeholder="Full Address" />
        </div>

        <div className="flex gap-4 w-full">
          <div className="flex flex-col relative group w-full">
            <label className="absolute ml-4 text-secondary/70 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
              Height
            </label>
            <Input placeholder="in inches" />
          </div>

          <div className="flex flex-col relative group w-full">
            <label className="absolute ml-4 text-secondary/70 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
              Weight
            </label>
            <Input placeholder="in kg" />
          </div>
        </div>

        <div>
          <Button>Continue</Button>
        </div>
      </div>
    </div>
  );
};
