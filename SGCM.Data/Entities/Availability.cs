using SGCM.Data.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SGCM.Data.Entities
{
    public class Availability
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public int DoctorId { get; set; }
        public Doctor Doctor { get; set; } = null!;

        public AvailableDay Day { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
    }
}
