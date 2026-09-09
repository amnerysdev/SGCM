using SGCM.Domain.Core;
using SGCM.Domain.Entities;

namespace SGCM.Application.Abstractions
{
    public interface IDoctorRepository : IBaseRepository<Doctor>
    {
        Task<OperationResult> GetByAppUserId(string appUserId);
        Task<OperationResult> GetBySpecialty(string specialtyId);
        Task<OperationResult> GetByMedicalLicenseAsync(string medicalLicense);
    }
}
