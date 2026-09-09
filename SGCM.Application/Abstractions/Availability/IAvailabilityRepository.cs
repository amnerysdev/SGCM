using SGCM.Domain.Core;
using SGCM.Domain.Entities;

namespace SGCM.Application.Abstractions
{
    public interface IAvailabilityRepository : IBaseRepository<Availability>
    {
        Task<OperationResult> GetByDoctor(string doctorId);
    }
}
