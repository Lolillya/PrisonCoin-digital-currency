import React from "react";

export const RegisterSteps = () => {
  const [isStep1Complete, setIsStep1Complete] = React.useState(false);
  const [isStep2Complete, setIsStep2Complete] = React.useState(false);
  const [isStep3Complete, setIsStep3Complete] = React.useState(false);
  const [isStep4Complete, setIsStep4Complete] = React.useState(false);
  const [isStep5Complete, setIsStep5Complete] = React.useState(false);

  const [currentStep, setCurrentStep] = React.useState(1);
  const steps = [
    { label: "Register Label 1", isComplete: isStep1Complete },
    { label: "Register Label 2", isComplete: isStep2Complete },
    { label: "Register Label 3", isComplete: isStep3Complete },
    { label: "Register Label 4", isComplete: isStep4Complete },
    { label: "Register Label 5", isComplete: isStep5Complete },
  ];

  return (
    /* This is a simple stepper component that displays the steps of a registration process.
         Each step has a label and a circle indicating whether it is complete or not. */
    <div className="flex items-end">
      {/* STEP 1 */}
      <div className="flex flex-col justify-center items-center gap-1">
        <label className="text-xs text-center">Register Label</label>
        <div className="flex justify-center items-center w-5 h-5 bg-primary rounded-full text-white p-5 font-bold">
          <span>1</span>
        </div>
      </div>

      {/* STEP LINE */}
      <div className="w-full h-1 mb-5 bg-gray-400"></div>

      {/* STEP 2 */}
      <div className="flex flex-col justify-center items-center gap-1">
        <label className="text-xs text-center">Register Label</label>
        <div className="flex justify-center items-center w-5 h-5 bg-gray-400 rounded-full text-white p-5 font-bold">
          <span>2</span>
        </div>
      </div>

      {/* STEP LINE */}
      <div className="w-full h-1 mb-5 bg-gray-400"></div>

      {/* STEP 3 */}
      <div className="flex flex-col justify-center items-center gap-1">
        <label className="text-xs text-center">Register Label</label>
        <div className="flex justify-center items-center w-5 h-5 bg-gray-400 rounded-full text-white p-5 font-bold">
          <span>3</span>
        </div>
      </div>

      {/* STEP LINE */}
      <div className="w-full h-1 mb-5 bg-gray-400"></div>

      {/* STEP 4 */}
      <div className="flex flex-col justify-center items-center gap-1">
        <label className="text-xs text-center">Register Label</label>
        <div className="flex justify-center items-center w-5 h-5 bg-gray-400 rounded-full text-white p-5 font-bold">
          <span>4</span>
        </div>
      </div>

      {/* STEP LINE */}
      <div className="w-full h-1 mb-5 bg-gray-400"></div>

      {/* STEP 5 */}
      <div className="flex flex-col justify-center items-center gap-1">
        <label className="text-xs text-center">Register Label</label>
        <div className="flex justify-center items-center w-5 h-5 bg-gray-400 rounded-full text-white p-5 font-bold">
          <span>5</span>
        </div>
      </div>
    </div>
  );
};
