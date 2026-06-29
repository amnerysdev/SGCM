namespace SGCM.Data.DTOs.DoctorDtos
{
    public class CreateDoctorDto
    {
        public string MedicalLicense { get; set; } = string.Empty;
        public string AppUserId { get; set; } = string.Empty;
        public string SpecialtyId { get; set; } = string.Empty;
    }
}
