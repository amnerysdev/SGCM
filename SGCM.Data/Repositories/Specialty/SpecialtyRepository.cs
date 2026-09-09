using SGCM.Data.Context;
using SGCM.Application.Abstractions;

namespace SGCM.Data.Repositories
{
    public class SpecialtyRepository : BaseRepository<Domain.Entities.Specialty>, ISpecialtyRepository
    {
        public SpecialtyRepository(SgcmDbContext context) : base(context)
        {
        }
    }
}
