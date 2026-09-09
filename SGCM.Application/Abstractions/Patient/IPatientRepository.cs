using SGCM.Domain.Core;
using SGCM.Domain.Entities;

namespace SGCM.Application.Abstractions
{
    public interface IPatientRepository : IBaseRepository<Patient>
    {
        Task<OperationResult> GetByAppUserId(string appUserId);
        Task<OperationResult> GetBySocialSecurityNumberAsync(string socialSecurityNumber);
    }
}
