using Microsoft.EntityFrameworkCore;
using SGCM.Data.Context;
using SGCM.Data.Entities;
using SGCM.Data.Repositories;
using Xunit;

namespace SGCM.Test.Repositories
{
    public class DoctorRepositoryTests
    {
        private SgcmDbContext CreateContext()
        {
            var options = new DbContextOptionsBuilder<SgcmDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            return new SgcmDbContext(options);
        }

        [Fact]
        public async Task GetByMedicalLicenseAsync_LicenciaVacia_DevuelveError()
        {
            // Arrange
            using var context = CreateContext();
            var repository = new DoctorRepository(context);

            // Act
            var result = await repository.GetByMedicalLicenseAsync("");

            // Assert
            Assert.False(result.Success);
            Assert.Equal("La licencia médica no puede estar vacía.", result.Message);
        }

        [Fact]
        public async Task GetByMedicalLicenseAsync_NoExiste_DevuelveError()
        {
            // Arrange
            using var context = CreateContext();
            var repository = new DoctorRepository(context);

            // Act
            var result = await repository.GetByMedicalLicenseAsync("LIC-9999");

            // Assert
            Assert.False(result.Success);
            Assert.Equal("No existe un doctor con esa licencia.", result.Message);
        }

        [Fact]
        public async Task GetByMedicalLicenseAsync_Existe_DevuelveDoctor()
        {
            // Arrange
            using var context = CreateContext();
            var doctor = new Doctor
            {
                MedicalLicense = "LIC-123",
                AppUserId = "user-1",
                SpecialtyId = "spec-1"
            };
            context.Doctors.Add(doctor);
            await context.SaveChangesAsync();

            var repository = new DoctorRepository(context);

            // Act
            var result = await repository.GetByMedicalLicenseAsync("LIC-123");

            // Assert
            Assert.True(result.Success);
            Assert.NotNull(result.Data);
            Assert.Equal("LIC-123", ((Doctor)result.Data).MedicalLicense);
        }
    }
}