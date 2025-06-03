

export const RegisterSteps = () => {
  

  return (
    /* This is a simple stepper component that displays the steps of a registration process.
         Each step has a label and a circle indicating whether it is complete or not. */
    <div className="flex items-end">
      {/* STEP 1 */}
      <div className="flex flex-col justify-center items-center gap-1">
        <label className="text-xs text-center">Personal Information</label>
        <div className="flex justify-center items-center w-5 h-5 bg-primary rounded-full text-white p-5 font-bold">
          <span>1</span>
        </div>
      </div>

      {/* STEP LINE */}
      <div className="w-full h-1 mb-5 bg-gray-400"></div>

      {/* STEP 2 */}
      <div className="flex flex-col justify-center items-center gap-1">
        <label className="text-xs text-center">Arrest Information</label>
        <div className="flex justify-center items-center w-5 h-5 bg-gray-400 rounded-full text-white p-5 font-bold">
          <span>2</span>
        </div>
      </div>

      {/* STEP LINE */}
      <div className="w-full h-1 mb-5 bg-gray-400"></div>

      {/* STEP 3 */}
      <div className="flex flex-col justify-center items-center gap-1">
        <label className="text-xs text-center">Biometric Entrollment</label>
        <div className="flex justify-center items-center w-5 h-5 bg-gray-400 rounded-full text-white p-5 font-bold">
          <span>3</span>
        </div>
      </div>

      {/* STEP LINE */}
      <div className="w-full h-1 mb-5 bg-gray-400"></div>

      {/* STEP 4 */}
      <div className="flex flex-col justify-center items-center gap-1">
        <label className="text-xs text-center">Wallet & Token Assignment</label>
        <div className="flex justify-center items-center w-5 h-5 bg-gray-400 rounded-full text-white p-5 font-bold">
          <span>4</span>
        </div>
      </div>

      {/* STEP LINE */}
      <div className="w-full h-1 mb-5 bg-gray-400"></div>

      {/* STEP 5 */}
      <div className="flex flex-col justify-center items-center gap-1">
        <label className="text-xs text-center">Register Confirmation</label>
        <div className="flex justify-center items-center w-5 h-5 bg-gray-400 rounded-full text-white p-5 font-bold">
          <span>5</span>
        </div>
      </div>
    </div>
  );
};
