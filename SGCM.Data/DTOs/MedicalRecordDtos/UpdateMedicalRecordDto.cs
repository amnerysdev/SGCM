namespace SGCM.Data.DTOs.MedicalRecordDtos
{
    public class UpdateMedicalRecordDto
    {
        public string Id { get; set; } = string.Empty;
        public string? Diagnosis { get; set; }
        public string? Treatment { get; set; }
        public string? Notes { get; set; }
    }
}
