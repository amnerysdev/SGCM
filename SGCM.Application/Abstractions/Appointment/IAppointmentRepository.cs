using SGCM.Domain.Core;
using SGCM.Domain.Entities;
using SGCM.Domain.Enums;

namespace SGCM.Application.Abstractions
{
    public interface IAppointmentRepository : IBaseRepository<Appointment>
    {
        Task<OperationResult> GetByPatient(string patientId);
        Task<OperationResult> GetByDoctor(string doctorId);
        Task<OperationResult> GetByStatus(AppointmentStatus status);
        Task<OperationResult> ChangeStatus(string appointmentId, AppointmentStatus status);
    }
}
