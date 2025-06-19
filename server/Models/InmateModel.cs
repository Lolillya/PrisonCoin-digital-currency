using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace server.Models
{
    public class InmateModel
    {
        // PERSONAL DETAILS
        public string FullName { get; set; }
        public string InmateNumber { get; set; }
        public string WalletAddress { get; set; }
        public decimal Height { get; set; }
        public decimal Weight { get; set; }

        // ARREST DETAILS
        public string ArrestingOfficer { get; set; }
        public DateTime ArrestDate { get; set; }
        public TimeSpan ArrestTime { get; set; }
        public string ArrestLocation { get; set; }
        public string Charges { get; set; }

        // BIOMETRIC (FINGER PRINT)
        public string FingerprintHash { get; set; }

    }
}