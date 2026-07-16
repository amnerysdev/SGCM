namespace SGCM.Data.DTOs.AppointmentDtos
{
    public class CreateAppointmentDto
    {
        public DateTime DateTime { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string PatientId { get; set; } = string.Empty;
        public string DoctorId { get; set; } = string.Empty;
    }
}
