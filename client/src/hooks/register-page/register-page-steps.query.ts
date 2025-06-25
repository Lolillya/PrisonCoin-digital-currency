import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface RegisterSteps {
  step1: boolean;
  step2: boolean;
  step3: boolean;
  step4: boolean;
  step5: boolean;
}

const initialSteps: RegisterSteps = {
  step1: false,
  step2: false,
  step3: false,
  step4: false,
  step5: false,
};

// Helper functions for localStorage
const getStoredSteps = (): RegisterSteps => {
  try {
    const stored = localStorage.getItem("registerSteps");
    return stored ? JSON.parse(stored) : initialSteps;
  } catch (error) {
    console.error("Error reading steps from localStorage:", error);
    return initialSteps;
  }
};

const setStoredSteps = (steps: RegisterSteps): void => {
  try {
    localStorage.setItem("registerSteps", JSON.stringify(steps));
  } catch (error) {
    console.error("Error writing steps to localStorage:", error);
  }
};

export const useRegisterSteps = () => {
  const queryClient = useQueryClient();

  const { data: steps = initialSteps } = useQuery<RegisterSteps>({
    queryKey: ["registerSteps"],
    initialData: getStoredSteps(),
    queryFn: () => Promise.resolve(getStoredSteps()),
    staleTime: Infinity, // Never consider the data stale
    gcTime: Infinity, // Keep in cache indefinitely
  });

  const updateStep = useMutation({
    mutationFn: (stepNumber: number) => {
      const stepKey = `step${stepNumber}` as keyof RegisterSteps;
      const newSteps: RegisterSteps = {
        ...steps,
        [stepKey]: true,
      };

      // Store in localStorage immediately
      setStoredSteps(newSteps);

      return Promise.resolve(newSteps);
    },
    onSuccess: (newSteps) => {
      queryClient.setQueryData(["registerSteps"], newSteps);
    },
  });

  // Function to reset steps (useful for starting over)
  const resetSteps = () => {
    setStoredSteps(initialSteps);
    queryClient.setQueryData(["registerSteps"], initialSteps);
  };

  // Function to set specific step
  const setStep = (stepNumber: number, completed: boolean) => {
    const stepKey = `step${stepNumber}` as keyof RegisterSteps;
    const newSteps: RegisterSteps = {
      ...steps,
      [stepKey]: completed,
    };

    setStoredSteps(newSteps);
    queryClient.setQueryData(["registerSteps"], newSteps);
  };

  return {
    steps,
    updateStep: (stepNumber: number) => updateStep.mutate(stepNumber),
    resetSteps,
    setStep,
  };
};
