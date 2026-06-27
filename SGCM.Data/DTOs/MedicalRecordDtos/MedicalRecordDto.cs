namespace SGCM.Data.DTOs.MedicalRecordDtos
{
    public class MedicalRecordDto
    {
        public string Id { get; set; } = string.Empty;
        public string Diagnosis { get; set; } = string.Empty;
        public string Treatment { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public DateTime CreationDate { get; set; }
        public string PatientId { get; set; } = string.Empty;
        public string DoctorId { get; set; } = string.Empty;
        public string AppointmentId { get; set; } = string.Empty;
    }
}
