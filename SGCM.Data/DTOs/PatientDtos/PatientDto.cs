namespace SGCM.Data.DTOs.PatientDtos
{
    public class PatientDto
    {
        public string Id { get; set; } = string.Empty;
        public string SocialSecurityNumber { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string Address { get; set; } = string.Empty;
        public string AppUserId { get; set; } = string.Empty;
    }
}
