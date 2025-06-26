const DashboardPage = () => {
  const outgoingTransactions = [
    {
      fromAddress: "0x74c8A64dfe3A471B3a0560fA2dF1A8d9ec18E144",
      toAddress: "0x8dc9854D9187C94f007945279b0d3308e42e208C",
      contractAddress: "0x8dc9854D9187C94f007945279b0d3308e42e208C",
      gas: 836811,
      amount: "0.01 ETH",
    },
    {
      fromAddress: "0x74c8A64dfe3A471B3a0560fA2dF1A8d9ec18E145",
      toAddress: "0x8dc9854D9187C94f007945279b0d3308e42e208D",
      contractAddress: "0x8dc9854D9187C94f007945279b0d3308e42e208D",
      gas: 836812,
      amount: "0.02 ETH",
    },
    {
      fromAddress: "0x74c8A64dfe3A471B3a0560fA2dF1A8d9ec18E146",
      toAddress: "0x8dc9854D9187C94f007945279b0d3308e42e208E",
      contractAddress: "0x8dc9854D9187C94f007945279b0d3308e42e208E",
      gas: 836813,
      amount: "0.03 ETH",
    },
    {
      fromAddress: "0x74c8A64dfe3A471B3a0560fA2dF1A8d9ec18E147",
      toAddress: "0x8dc9854D9187C94f007945279b0d3308e42e208F",
      contractAddress: "0x8dc9854D9187C94f007945279b0d3308e42e208F",
      gas: 836814,
      amount: "0.04 ETH",
    },
  ];

  const ingoingTransactions = [
    {
      fromAddress: "0x74c8A64dfe3A471B3a0560fA2dF1A8d9ec18E144",
      toAddress: "0x8dc9854D9187C94f007945279b0d3308e42e208C",
      contractAddress: "0x8dc9854D9187C94f007945279b0d3308e42e208C",
      gas: 836811,
      amount: "0.01 ETH",
    },
    {
      fromAddress: "0x74c8A64dfe3A471B3a0560fA2dF1A8d9ec18E145",
      toAddress: "0x8dc9854D9187C94f007945279b0d3308e42e208D",
      contractAddress: "0x8dc9854D9187C94f007945279b0d3308e42e208D",
      gas: 836812,
      amount: "0.02 ETH",
    },
    {
      fromAddress: "0x74c8A64dfe3A471B3a0560fA2dF1A8d9ec18E146",
      toAddress: "0x8dc9854D9187C94f007945279b0d3308e42e208E",
      contractAddress: "0x8dc9854D9187C94f007945279b0d3308e42e208E",
      gas: 836813,
      amount: "0.03 ETH",
    },
    {
      fromAddress: "0x74c8A64dfe3A471B3a0560fA2dF1A8d9ec18E147",
      toAddress: "0x8dc9854D9187C94f007945279b0d3308e42e208F",
      contractAddress: "0x8dc9854D9187C94f007945279b0d3308e42e208F",
      gas: 836814,
      amount: "0.04 ETH",
    },
  ];
  return (
    <section className="section-container flex flex-col">
      <div className="flex gap-1">
        <div className="flex-1 flex flex-col gap-4">
          <h3>Available Balance</h3>
          <h3>$0.00</h3>
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
      <div className="flex-1">
        <h3>In-going Transactions</h3>

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
            {ingoingTransactions.map((tx, index) => (
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
      </div>

      <div className="flex-1">
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
      </div>
    </section>
  );
};

export default DashboardPage;
