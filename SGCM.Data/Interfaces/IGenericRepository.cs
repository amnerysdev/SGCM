using SGCM.Data.Core;

namespace SGCM.Data.Interfaces
{
    public interface IGenericRepository<T> where T : class
    {
        Task<OperationResult> GetByIdAsync(string id);
        Task<OperationResult> GetAllAsync();
        Task<OperationResult> AddAsync(T entity);
        Task<OperationResult> SaveChangesAsync();
    }
}