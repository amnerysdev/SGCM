using SGCM.Data.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SGCM.Data.DTOs
{
    public class AppointmentDto
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public DateTime DateTime { get; set; }
        public string Reason { get; set; } = string.Empty;
        public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;
    }
}
