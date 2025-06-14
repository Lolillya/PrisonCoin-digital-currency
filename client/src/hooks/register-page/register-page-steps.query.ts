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

export const useRegisterSteps = () => {
  const queryClient = useQueryClient();

  const { data: steps = initialSteps } = useQuery<RegisterSteps>({
    queryKey: ["registerSteps"],
    initialData: initialSteps,
    queryFn: () => Promise.resolve(initialSteps),
  });

  const updateStep = useMutation({
    mutationFn: (stepNumber: number) => {
      const stepKey = `step${stepNumber}` as keyof RegisterSteps;
      return Promise.resolve({
        ...steps,
        [stepKey]: true,
      });
    },
    onSuccess: (newSteps) => {
      queryClient.setQueryData(["registerSteps"], newSteps);
    },
  });

  return {
    steps,
    updateStep: (stepNumber: number) => updateStep.mutate(stepNumber),
  };
};
