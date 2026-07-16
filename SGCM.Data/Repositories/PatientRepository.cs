using Microsoft.EntityFrameworkCore;
using SGCM.Data.Context;
using SGCM.Data.Core;
using SGCM.Data.Entities;
using SGCM.Data.Interfaces;

namespace SGCM.Data.Repositories
{
    public class PatientRepository : GenericRepository<Patient>, IPatientRepository
    {
        public PatientRepository(SgcmDbContext context) : base(context)
        {
        }

        public async Task<OperationResult> GetBySocialSecurityNumberAsync(string socialSecurityNumber)
        {
            if (string.IsNullOrWhiteSpace(socialSecurityNumber))
                return new OperationResult { Success = false, Message = "El número de seguro social no puede estar vacío." };

            var patient = await _dbSet.FirstOrDefaultAsync(p => p.SocialSecurityNumber == socialSecurityNumber);
            if (patient == null)
                return new OperationResult { Success = false, Message = "No existe un paciente con ese número de seguro social." };

            return new OperationResult { Data = patient };
        }
    }
}