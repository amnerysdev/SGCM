using Microsoft.EntityFrameworkCore;
using SGCM.Data.Context;
using SGCM.Data.Entities;
using SGCM.Data.Repositories;
using Xunit;

namespace SGCM.Test.Repositories
{
    public class PatientRepositoryTests
    {
        private SgcmDbContext CreateContext()
        {
            var options = new DbContextOptionsBuilder<SgcmDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new SgcmDbContext(options);
        }
         
        [Fact]
        public async Task GetBySocialSecurityNumberAsync_NumeroVacio_DevuelveError()
        {
            using var context = CreateContext();
            var repository = new PatientRepository(context);

            var result = await repository.GetBySocialSecurityNumberAsync("");

            Assert.False(result.Success);
            Assert.Equal("El número de seguro social no puede estar vacío.", result.Message);
        }

        [Fact]
        public async Task GetBySocialSecurityNumberAsync_NoExiste_DevuelveError()
        {
            using var context = CreateContext();
            var repository = new PatientRepository(context);

            var result = await repository.GetBySocialSecurityNumberAsync("000-0000000-0");

            Assert.False(result.Success);
            Assert.Equal("No existe un paciente con ese número de seguro social.", result.Message);
        }

        [Fact]
        public async Task GetBySocialSecurityNumberAsync_Existe_DevuelvePaciente()
        {
            using var context = CreateContext();
            var patient = new Patient
            {
                SocialSecurityNumber = "001-1234567-8",
                AppUserId = "user-2"
            };
            context.Patients.Add(patient);
            await context.SaveChangesAsync();

            var repository = new PatientRepository(context);

            var result = await repository.GetBySocialSecurityNumberAsync("001-1234567-8");

            Assert.True(result.Success);
            Assert.NotNull(result.Data);
            Assert.Equal("001-1234567-8", ((Patient)result.Data).SocialSecurityNumber);
        }
    }
}