import { CheckIcon } from "@/components/icons/icons";
import { useRegisterSteps } from "@/hooks/register-page/register-page-steps.query";

export const RegisterSteps = () => {
  const { steps } = useRegisterSteps();

  /* 
  DISPLAYS THE STEPS OF A REGISTRATION PROCESS.
  EACH STEP HAS A LABEL AND A CIRCLE 
  INDICATING WHETHER IT IS COMPLETE OR NOT. 
  */

  return (
    <div className="flex items-end">
      {/* STEP 1 */}
      <div className="flex flex-col justify-center items-center gap-1">
        <label className="text-xs text-center">Personal Information</label>
        <div
          className={`flex justify-center items-center  ${
            steps.step1 ? "bg-primary p-2" : "bg-gray-400 p-5 h-5 w-5"
          } rounded-full text-white font-bold`}
        >
          {steps.step1 ? <CheckIcon /> : <span>1</span>}
        </div>
      </div>

      {/* STEP LINE */}
      <div
        className={`w-full h-1 mb-5 ${
          steps.step1 ? "bg-primary" : "bg-gray-400"
        }`}
      ></div>

      {/* STEP 2 */}
      <div className="flex flex-col justify-center items-center gap-1">
        <label className="text-xs text-center">Arrest Information</label>
        <div
          className={`flex justify-center items-center  ${
            steps.step2 ? "bg-primary p-2" : "bg-gray-400 p-5 w-5 h-5"
          } rounded-full text-white font-bold`}
        >
          {steps.step2 ? <CheckIcon /> : <span>2</span>}
        </div>
      </div>

      {/* STEP LINE */}
      <div
        className={`w-full h-1 mb-5 ${
          steps.step2 ? "bg-primary" : "bg-gray-400"
        }`}
      ></div>

      {/* STEP 3 */}
      <div className="flex flex-col justify-center items-center gap-1">
        <label className="text-xs text-center">Biometric Entrollment</label>
        <div
          className={`flex justify-center items-center  ${
            steps.step3 ? "bg-primary p-2" : "bg-gray-400 p-5 w-5 h-5"
          } rounded-full text-white font-bold`}
        >
          {steps.step3 ? <CheckIcon /> : <span>3</span>}
        </div>
      </div>

      {/* STEP LINE */}
      <div
        className={`w-full h-1 mb-5 ${
          steps.step3 ? "bg-primary" : "bg-gray-400"
        }`}
      ></div>

      {/* STEP 4 */}
      <div className="flex flex-col justify-center items-center gap-1">
        <label className="text-xs text-center">Wallet & Token Assignment</label>
        <div
          className={`flex justify-center items-center  ${
            steps.step4 ? "bg-primary p-2" : "bg-gray-400 p-5 w-5 h-5"
          } rounded-full text-white font-bold`}
        >
          {steps.step4 ? <CheckIcon /> : <span>4</span>}
        </div>
      </div>

      {/* STEP LINE */}
      <div
        className={`w-full h-1 mb-5 ${
          steps.step4 ? "bg-primary" : "bg-gray-400"
        }`}
      ></div>

      {/* STEP 5 */}
      <div className="flex flex-col justify-center items-center gap-1">
        <label className="text-xs text-center">Register Confirmation</label>
        <div
          className={`flex justify-center items-center  ${
            steps.step5 ? "bg-primary p-2" : "bg-gray-400 p-5 w-5 h-5"
          } rounded-full text-white font-bold`}
        >
          {steps.step5 ? <CheckIcon /> : <span>5</span>}
        </div>
      </div>
    </div>
  );
};
