using System.ComponentModel.DataAnnotations;

namespace server.Models
{
    public class SendEthRequest
    {
        [Required]
        public string ToAddress { get; set; }
        
        [Required]
        [Range(0.000001, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }
        
        [Required]
        public string Reason { get; set; }
    }

    public class SendEthBatchRequest
    {
        [Required]
        public List<string> Recipients { get; set; }
        
        [Required]
        public List<decimal> Amounts { get; set; }
        
        [Required]
        public string Reason { get; set; }
    }

    public class WithdrawEthRequest
    {
        [Required]
        public string ToAddress { get; set; }
        
        [Required]
        [Range(0.000001, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }
    }

    public class UpdateTreasuryRequest
    {
        [Required]
        public string NewTreasuryAddress { get; set; }
    }

    public class UpdateOperatorRequest
    {
        [Required]
        public string NewOperatorAddress { get; set; }
    }
} 