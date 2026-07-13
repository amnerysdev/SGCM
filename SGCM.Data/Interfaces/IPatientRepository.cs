using SGCM.Data.Core;
using SGCM.Data.Entities;

namespace SGCM.Data.Interfaces
{
    public interface IPatientRepository : IGenericRepository<Patient>
    {
        Task<OperationResult> GetBySocialSecurityNumberAsync(string socialSecurityNumber);
    }
}