import { RegisterInputs } from "./components/register-inputs";
import { RegisterSteps } from "./components/register-steps";

const ResgisterPage = () => {
  return (
    <section className="section-container">
      <RegisterSteps />
      <RegisterInputs />
    </section>
  );
};

export default ResgisterPage;
