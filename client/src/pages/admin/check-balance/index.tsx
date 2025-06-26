import { getWalletBalance } from "@/api/inmates";
import { PesoCurrencyIcon } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const CheckBalancePage = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState("0.00");
  const handleClick = async () => {
    const res = await getWalletBalance(walletAddress);
    setBalance(res.ethBalance);

    console.log("Response from getWalletAddress:", res);
  };
  return (
    <section className="section-container flex flex-col">
      <div className="flex justify-center flex-col items-center">
        {/* <label className="text-text font-semibold text-xl">Available Balance</label>
        <span className="flex items-center gap-1 text-lg text-text">
          <PesoCurrencyIcon /> 50,000.00
        </span> */}

        <div className="flex gap-2 ">
          <div className="flex flex-col gap-2">
            <Input
              type="text"
              placeholder="wallet address"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
            />
            <span>{balance} ETH</span>
          </div>
          <Button className="btn btn-primary mt-4" onClick={handleClick}>
            Check Balance
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CheckBalancePage;
