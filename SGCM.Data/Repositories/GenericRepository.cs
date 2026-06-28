using Microsoft.EntityFrameworkCore;
using SGCM.Data.Context;
using SGCM.Data.Core;
using SGCM.Data.Interfaces;

namespace SGCM.Data.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        protected readonly SgcmDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public GenericRepository(SgcmDbContext context)
        {
            _context = context;
            _dbSet = _context.Set<T>();
        }

        public async Task<OperationResult> GetByIdAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return new OperationResult { Success = false, Message = "El id no puede estar vacío." };

            var entity = await _dbSet.FindAsync(id);
            if (entity == null)
                return new OperationResult { Success = false, Message = "No se encontró el registro." };

            return new OperationResult { Data = entity };
        }

        public async Task<OperationResult> GetAllAsync()
        {
            var entities = await _dbSet.ToListAsync();
            return new OperationResult { Data = entities };
        }

        public async Task<OperationResult> AddAsync(T entity)
        {
            if (entity == null)
                return new OperationResult { Success = false, Message = "La entidad no puede ser nula." };

            await _dbSet.AddAsync(entity);
            return new OperationResult { Data = entity };
        }

        public async Task<OperationResult> SaveChangesAsync()
        {
            var affectedRows = await _context.SaveChangesAsync();
            return new OperationResult { Data = affectedRows };
        }
    }
}