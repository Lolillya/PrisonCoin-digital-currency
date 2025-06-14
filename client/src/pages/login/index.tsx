import { Button } from "../../components/ui/button";
import { EthLogo } from "../../components/icons/eth-logo";
import { Input } from "@/components/ui/input";

const LoginPage = () => {
  return (
    <section className=" justify-center items-center">
      <div className="w-96 p-6">
        <div className="flex gap-4 items-center">
          <EthLogo width={100} height={100} />
          <h1>PrisonCoin</h1>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 w-full">
            <div className="group relative">
              <label className="absolute ml-4 text-secondary/70 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
                Username
              </label>
              <Input />
            </div>

            <div className="group relative">
              <label className="absolute ml-4 text-secondary/70 text-base mt-2 transition-all duration-200 group-focus-within:text-xs">
                Password
              </label>
              <Input />
            </div>
          </div>
          <Button>Login</Button>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
