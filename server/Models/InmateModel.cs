using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Numerics;
using Nethereum.ABI.FunctionEncoding.Attributes;

namespace server.Models
{
    public class InmateModel
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        // PERSONAL DETAILS
        public string? InmateNumber { get; set; }
        public string? FullName { get; set; }
        public string? Address { get; set; }
        public decimal Height { get; set; }
        public decimal Weight { get; set; }

        // ARREST DETAILS
        public string? ArrestingOfficer { get; set; }
        public string? ArrestDate { get; set; }
        public string? ArrestTime { get; set; }
        public string? ArrestLocation { get; set; }
        public string? Charges { get; set; }

        // BIOMETRIC (FINGER PRINT)
        public string? FingerprintHash { get; set; }

        // WALLET
        public string? WalletAddress { get; set; }
        public int InitialBalance { get; set; }
        public int DailySpendingLimit { get; set; }

    }

    [FunctionOutput]
    public class TransactionModel
    {
        [Parameter("address", "from", 1)]
        public string From { get; set; }
        
        [Parameter("address", "to", 2)]
        public string To { get; set; }
        
        [Parameter("string", "item", 3)]
        public string Item { get; set; }
        
        [Parameter("uint256", "amount", 4)]
        public BigInteger Amount { get; set; }
        
        [Parameter("uint256", "timestamp", 5)]
        public BigInteger Timestamp { get; set; }
    }

    [FunctionOutput]
    public class PaginatedTransactionsResult
    {
        [Parameter("tuple[]", "transactions", 1)]
        public List<TransactionModel> Transactions { get; set; }
        
        [Parameter("uint256", "totalCount", 2)]
        public BigInteger TotalCount { get; set; }
    }

    [FunctionOutput]
    public class AllTransactionsResult
    {
        [Parameter("tuple[]", "transactions", 1)]
        public List<TransactionModel> Transactions { get; set; }
    }

    // ETH Transfer Request Models
    public class TransferEthRequest
    {
        public string ToAddress { get; set; }
        public decimal Amount { get; set; }
        public string Reason { get; set; }
    }

    public class TransferEthBatchRequest
    {
        public List<string> Recipients { get; set; }
        public List<decimal> Amounts { get; set; }
        public string Reason { get; set; }
    }

    public class WithdrawEthRequest
    {
        public string ToAddress { get; set; }
        public decimal Amount { get; set; }
    }

    public class FundContractRequest
    {
        public decimal Amount { get; set; }
    }
}