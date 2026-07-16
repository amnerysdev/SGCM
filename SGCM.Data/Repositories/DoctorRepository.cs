using Microsoft.EntityFrameworkCore;
using SGCM.Data.Context;
using SGCM.Data.Core;
using SGCM.Data.Entities;
using SGCM.Data.Interfaces;

namespace SGCM.Data.Repositories
{
    public class DoctorRepository : GenericRepository<Doctor>, IDoctorRepository
    {
        public DoctorRepository(SgcmDbContext context) : base(context)
        {
        }

        public async Task<OperationResult> GetByMedicalLicenseAsync(string medicalLicense)
        {
            if (string.IsNullOrWhiteSpace(medicalLicense))
                return new OperationResult { Success = false, Message = "La licencia médica no puede estar vacía." };

            var doctor = await _dbSet.FirstOrDefaultAsync(d => d.MedicalLicense == medicalLicense);
            if (doctor == null)
                return new OperationResult { Success = false, Message = "No existe un doctor con esa licencia." };

            return new OperationResult { Data = doctor };
        }
    }
}