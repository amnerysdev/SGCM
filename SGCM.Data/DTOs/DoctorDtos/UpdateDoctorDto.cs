namespace SGCM.Data.DTOs.DoctorDtos
{
    public class UpdateDoctorDto
    {
        public string Id { get; set; } = string.Empty;
        public string? MedicalLicense { get; set; }
        public string? SpecialtyId { get; set; }
    }
}
