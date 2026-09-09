using SGCM.Domain.Core;
using SGCM.Domain.Entities;

namespace SGCM.Application.Abstractions
{
    public interface IMedicalRecordRepository : IBaseRepository<MedicalRecord>
    {
        Task<OperationResult> GetByPatient(string patientId);
        Task<OperationResult> GetByAppointment(string appointmentId);
    }
}
