using SGCM.Data.Core;
using SGCM.Data.Entities;

namespace SGCM.Data.Interfaces
{
    public interface IDoctorRepository : IGenericRepository<Doctor>
    {
        Task<OperationResult> GetByMedicalLicenseAsync(string medicalLicense);
    }
}