import { useState, useEffect } from "react";
import { getTransactions, getWalletBalance } from "@/api/inmates";
import { env } from "@/env";

const DashboardPage = () => {
  const [availableBalance, setAvailableBalance] = useState<any>(0);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any>([]);

  console.log(transactions);

  useEffect(() => {
    const fetchTransactions = async () => {
      const transactions = await getTransactions();
      setTransactions(transactions);
    };
    fetchTransactions();
  }, []);
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balance = await getWalletBalance(env.TREASURY_WALLET_ADDRESS);
        setAvailableBalance(balance);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        setAvailableBalance(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);
  
  return (
    <section className="section-container flex flex-col">
      <div className="flex gap-1">
        <div className="flex-1 flex flex-col gap-4">
          <h3>Available Balance</h3>
          <span>{loading ? "Loading..." : `$${availableBalance.ethBalance} ETH`}</span>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <h3 className="">Total In-Going</h3>
          <h3 className="">4</h3>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <h3 className="">Total Out-Going</h3>
          <h3 className="">4</h3>
        </div>
      </div>

      {/* TRANSACTION PANEL */}
      <div className="flex-1 overflow-y-hidden">
        <h3>Transactions</h3>

        <table className="rounded-xl overflow-hidden shadow-md border-2 border-gray-200">
          <thead>
            <tr>
              <th>From Address</th>
              <th>To Address</th>
              <th>Contract Address</th>
              <th>Gas</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody className="overflow-y-auto">
            {transactions.transactions.map((tx: any, index: number) => (
              <tr key={index}>
                <td className="text-ellipsis max-w-40 overflow-hidden">{tx.from}</td>
                <td className="text-ellipsis max-w-40 overflow-hidden">{tx.to}</td>
                <td className="text-ellipsis max-w-40 overflow-hidden">{tx.contractAddress}</td>
                <td>{tx.gasPrice}</td>
                <td>{tx.valueInEth}</td>
              </tr>
            ))}
            {/* {ingoingTransactions.map((tx, index) => (
              <tr key={index}>
                <td className="text-ellipsis max-w-40 overflow-hidden">{tx.fromAddress}</td>
                <td className="text-ellipsis max-w-40 overflow-hidden">{tx.toAddress}</td>
                <td className="text-ellipsis max-w-40 overflow-hidden">{tx.contractAddress}</td>
                <td>{tx.gas}</td>
                <td>{tx.amount}</td>
              </tr>
            ))} */}
          </tbody>
        </table>
      </div>

      {/* <div className="flex-1">
        <h3>Out-going Transactions</h3>

        <table className="rounded-xl overflow-hidden shadow-md">
          <thead>
            <tr>
              <th>From Address</th>
              <th>To Address</th>
              <th>Contract Address</th>
              <th>Gas</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {outgoingTransactions.map((tx, index) => (
              <tr key={index}>
                <td className="text-ellipsis max-w-40 overflow-hidden">{tx.fromAddress}</td>
                <td className="text-ellipsis max-w-40 overflow-hidden">{tx.toAddress}</td>
                <td className="text-ellipsis max-w-40 overflow-hidden">{tx.contractAddress}</td>
                <td>{tx.gas}</td>
                <td>{tx.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}
    </section>
  );
};

export default DashboardPage;
