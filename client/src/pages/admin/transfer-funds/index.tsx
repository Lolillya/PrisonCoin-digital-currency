import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  transferFunds,
  getTreasuryBalance,
  validateEthAddress,
  validateAmount,
  TransferFundsRequest,
  TransferFundsResponse,
} from "@/api/transfers";
import { useTreasuryBalance } from "@/hooks/home/home-treasury-balance";

const TransferFundsPage = () => {
  const [formData, setFormData] = useState<TransferFundsRequest>({
    toAddress: "",
    amount: 0,
    reason: "",
  });

  const { balance, loading: balanceLoading } = useTreasuryBalance();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<TransferFundsResponse | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    toAddress?: string;
    amount?: string;
    reason?: string;
  }>({});

  


  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    // Validate recipient address
    if (!formData.toAddress.trim()) {
      errors.toAddress = "Recipient address is required";
    } else if (!validateEthAddress(formData.toAddress)) {
      errors.toAddress = "Invalid Ethereum address format";
    }

    // Validate amount
    

    // Validate reason
    if (!formData.reason.trim()) {
      errors.reason = "Transfer reason is required";
    } else if (formData.reason.length < 5) {
      errors.reason = "Reason must be at least 5 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof TransferFundsRequest, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await transferFunds(formData);
      setSuccess(response);

      // Reset form on success
      setFormData({
        toAddress: "",
        amount: 0,
        reason: "",
      });

      // Reload treasury balance
      await getTreasuryBalance();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Transfer failed");
    } finally {
      setIsLoading(false);
    }
  };

  const formatEthAmount = (amount: number): string => {
    return `${amount.toFixed(6)} ETH`;
  };

  const formatUsdAmount = (ethAmount: number): string => {
    const ethPrice = 2000; // Approximate ETH price
    return `~$${(ethAmount * ethPrice).toFixed(2)} USD`;
  };

  return (
    <section className="section-container overflow-y-scroll flex flex-col gap-4">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-2 justify-center items-center">
        <h1 className="text-3xl font-bold text-text mb-2">Fund Transfer</h1>
        <p className="text-text/80">Transfer ETH from treasury to inmate wallets</p>
      </div>

      {/* Treasury Balance Card */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-md p-6 border border-border/20 flex flex-col gap-4 item-center justify-center">
        <h2 className="text-lg font-semibold text-text mb-4 text-center">Treasury Balance</h2>
        {balanceLoading ? (
          <div className="flex items-center gap-3 justify-center">
            <div className="w-4 h-4 border-2 border-highlight border-t-transparent rounded-full animate-spin"></div>
            <span className="text-text/80">Loading treasury balance...</span>
          </div>
        ) : balance ? (
          <div className="grid  gap-4 justify-center items-center">
            <div className="text-center flex flex-col gap-2 justify-center items-center ">
              <div className="text-2xl font-bold text-highlight">{balance}</div>
              <div className="text-sm text-text/60">Available Balance</div>
            </div>

            
          </div>
        ) : (
          <div className="text-alert text-sm">Failed to load treasury balance</div>
        )}
      </div>

      {/* Transfer Form */}
      <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-md p-6 border border-border/20">
        <h2 className="text-lg font-semibold text-text mb-4">Transfer Funds</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient Address */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">Recipient Address</label>
            <Input
              type="text"
              placeholder="0x..."
              value={formData.toAddress}
              onChange={(e) => handleInputChange("toAddress", e.target.value)}
              className={`w-full ${validationErrors.toAddress ? "border-alert" : ""}`}
            />
            {validationErrors.toAddress && <p className="text-alert text-sm mt-1">{validationErrors.toAddress}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">Amount (ETH)</label>
            <div className="relative">
              <Input
                type="number"
                step="0.000001"
                min="0"
                max="1000"
                placeholder="0.001"
                value={formData.amount || ""}
                onChange={(e) => handleInputChange("amount", parseFloat(e.target.value) || 0)}
                className={`w-full ${validationErrors.amount ? "border-alert" : ""}`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text/60 text-sm">ETH</div>
            </div>
            {validationErrors.amount && <p className="text-alert text-sm mt-1">{validationErrors.amount}</p>}
            {formData.amount > 0 && !validationErrors.amount && (
              <p className="text-text/60 text-sm mt-1">{formatUsdAmount(formData.amount)}</p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">Transfer Reason</label>
            <Input
              type="text"
              placeholder="e.g., Inmate release funds, Medical expenses, etc."
              value={formData.reason}
              onChange={(e) => handleInputChange("reason", e.target.value)}
              className={`w-full ${validationErrors.reason ? "border-alert" : ""}`}
            />
            {validationErrors.reason && <p className="text-alert text-sm mt-1">{validationErrors.reason}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoading || balanceLoading}
              className="flex-1 bg-highlight hover:bg-highlight/80 text-text font-medium py-3 px-6 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-text border-t-transparent rounded-full animate-spin"></div>
                  Processing Transfer...
                </>
              ) : (
                <>
                  Transfer Funds
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-alert/20 p-4 rounded-lg border border-alert">
          <h3 className="font-semibold text-alert mb-2">Transfer Failed</h3>
          <p className="text-alert/80 text-sm">{error}</p>
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className="bg-success/20 p-4 rounded-lg border border-success">
          <h3 className="font-semibold text-success mb-2">Transfer Successful</h3>
          <div className="space-y-2 text-sm text-success/80">
            <p>
              <strong>Transaction Hash:</strong>
            </p>
            <p className="font-mono text-xs break-all bg-background/20 p-2 rounded">{success.transactionHash}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <p>
                  <strong>From:</strong> Treasury
                </p>
                <p>
                  <strong>To:</strong> {success.toAddress}
                </p>
              </div>
              <div>
                <p>
                  <strong>Amount:</strong> {formatEthAmount(success.amount)}
                </p>
                <p>
                  <strong>Reason:</strong> {success.reason}
                </p>
              </div>
            </div>
            <p className="text-xs mt-2">
              <strong>Timestamp:</strong> {new Date(success.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Transfer Guidelines */}
      <div className="bg-accent/20 p-6 rounded-lg border border-accent/30">
        <h3 className="font-semibold text-text mb-3">Transfer Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text/80">
          <div>
            <h4 className="font-medium text-text mb-2">Allowed Transfers</h4>
            <ul className="space-y-1">
              <li>• Inmate release funds</li>
              <li>• Medical expenses</li>
              <li>• Legal fees</li>
              <li>• Educational programs</li>
              <li>• Emergency situations</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-text mb-2">Important Notes</h4>
            <ul className="space-y-1">
              <li>• Maximum transfer: 1000 ETH</li>
              <li>• Minimum transfer: 0.000001 ETH</li>
              <li>• All transfers are recorded on blockchain</li>
              <li>• Transaction fees apply</li>
              <li>• Transfers are irreversible</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransferFundsPage;
