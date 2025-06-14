import { PesoCurrencyIcon } from "@/components/icons/icons";

const CheckBalancePage = () => {
  return (
    <section>
      <div className="flex justify-center flex-col items-center">
        <label className="text-text font-semibold text-xl">
          Available Balance
        </label>
        <span className="flex items-center gap-1 text-lg text-text">
          <PesoCurrencyIcon /> 50,000.00
        </span>
      </div>
    </section>
  );
};

export default CheckBalancePage;
