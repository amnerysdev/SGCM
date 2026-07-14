using SGCM.Data.Repositories;
using SGCM.Domain.Entities;
using SGCM.Test.Common;
using Xunit;

namespace SGCM.Test.Repositories
{
    public class DoctorRepositoryTests
    {
        private static Doctor NewDoctor(
            string appUserId = "user-1",
            string specialtyId = "specialty-1") => new Doctor
        {
            MedicalLicense = "LIC-001",
            AppUserId = appUserId,
            SpecialtyId = specialtyId
        };

        [Fact]
        public async Task GetByAppUserId_WhenDoctorExists_ShouldReturnIt()
        {
            using var context = TestDbContextFactory.Create();
            var repository = new DoctorRepository(context);
            var doctor = NewDoctor(appUserId: "user-7");
            await repository.Add(doctor);

            var result = await repository.GetByAppUserId("user-7");

            Assert.True(result.Success);
            var found = (Doctor)result.Data!;
            Assert.Equal(doctor.Id, found.Id);
        }

        [Fact]
        public async Task GetByAppUserId_WhenDoctorDoesNotExist_ShouldFail()
        {
            using var context = TestDbContextFactory.Create();
            var repository = new DoctorRepository(context);

            var result = await repository.GetByAppUserId("user-inexistente");

            Assert.False(result.Success);
            Assert.Equal("Doctor no encontrado.", result.Message);
        }

        [Fact]
        public async Task GetBySpecialty_ShouldReturnOnlyDoctorsOfSpecialty()
        {
            using var context = TestDbContextFactory.Create();
            var repository = new DoctorRepository(context);
            await repository.Add(NewDoctor(appUserId: "user-1", specialtyId: "cardio"));
            await repository.Add(NewDoctor(appUserId: "user-2", specialtyId: "cardio"));
            await repository.Add(NewDoctor(appUserId: "user-3", specialtyId: "pediatria"));

            var result = await repository.GetBySpecialty("cardio");

            Assert.True(result.Success);
            var doctors = (List<Doctor>)result.Data!;
            Assert.Equal(2, doctors.Count);
            Assert.All(doctors, d => Assert.Equal("cardio", d.SpecialtyId));
        }
    }
}
