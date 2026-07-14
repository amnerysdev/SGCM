using SGCM.Data.Repositories;
using SGCM.Domain.Entities;
using SGCM.Test.Common;
using Xunit;

namespace SGCM.Test.Repositories
{
    public class PatientRepositoryTests
    {
        private static Patient NewPatient(string appUserId = "user-1") => new Patient
        {
            SocialSecurityNumber = "001-0000001-1",
            DateOfBirth = new DateTime(1990, 5, 20),
            Address = "Calle Principal #1",
            AppUserId = appUserId
        };

        [Fact]
        public async Task GetByAppUserId_WhenPatientExists_ShouldReturnIt()
        {
            using var context = TestDbContextFactory.Create();
            var repository = new PatientRepository(context);
            var patient = NewPatient(appUserId: "user-5");
            await repository.Add(patient);

            var result = await repository.GetByAppUserId("user-5");

            Assert.True(result.Success);
            var found = (Patient)result.Data!;
            Assert.Equal(patient.Id, found.Id);
        }

        [Fact]
        public async Task GetByAppUserId_WhenPatientDoesNotExist_ShouldFail()
        {
            using var context = TestDbContextFactory.Create();
            var repository = new PatientRepository(context);

            var result = await repository.GetByAppUserId("user-inexistente");

            Assert.False(result.Success);
            Assert.Equal("Paciente no encontrado.", result.Message);
        }
    }
}
