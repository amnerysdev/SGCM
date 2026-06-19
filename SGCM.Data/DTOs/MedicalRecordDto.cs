using SGCM.Data.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SGCM.Data.DTOs
{
    public class MedicalRecordDto
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Diagnosis { get; set; } = string.Empty;
        public string Treatment { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public DateTime CreationDate { get; set; } = DateTime.UtcNow;
        public string PatientId { get; set; }
        public string DoctorId { get; set; }
        public string AppointmentId { get; set; }

    }
}
