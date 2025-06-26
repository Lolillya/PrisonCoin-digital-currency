using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
}