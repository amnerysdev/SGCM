namespace SGCM.Data.DTOs.PatientDtos
{
    public class UpdatePatientDto
    {
        public string Id { get; set; } = string.Empty;
        public string? SocialSecurityNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Address { get; set; }
    }
}
