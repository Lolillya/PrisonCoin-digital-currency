import { Button } from "../../components/ui/button";
import { EthLogo } from "../../components/icons/eth-logo";

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
            <input type="text" placeholder="Email" />
            <input type="password" placeholder="Password" />
          </div>
          <Button>Login</Button>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
