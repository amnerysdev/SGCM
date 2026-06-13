namespace SGCM.Data.Entities
{
    public class Paciente
    {
        public int PacienteId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public string CorreoElectronico { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public DateTime FechaDeNacimiento { get; set; }
        public string Contrasena { get; set; } = string.Empty;
    }
}