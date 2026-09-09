using Microsoft.AspNetCore.Identity;
using Moq;
using SGCM.Data.Context;
using SGCM.Data.Seeding;
using SGCM.Domain.Constants;
using SGCM.Domain.Entities;
using SGCM.Test.Common;
using Xunit;

namespace SGCM.Test.Integration;

public class SeedIdempotencyTests
{
    [Fact]
    public async Task SeedAsync_ShouldBeIdempotent_WhenRunTwice()
    {
        using var context = TestDbContextFactory.Create();
        context.Database.EnsureCreated();

        var userManager = MockUserManager();
        var roleManager = MockRoleManager();

        var seeder = new DevelopmentDataSeeder();
        await seeder.SeedAsync(context, userManager.Object, roleManager.Object);

        var usersAfterFirst = context.Users.Count();
        var doctorsAfterFirst = context.Doctors.Count();
        var patientsAfterFirst = context.Patients.Count();

        await seeder.SeedAsync(context, userManager.Object, roleManager.Object);

        Assert.Equal(usersAfterFirst, context.Users.Count());
        Assert.Equal(doctorsAfterFirst, context.Doctors.Count());
        Assert.Equal(patientsAfterFirst, context.Patients.Count());
    }

    [Fact]
    public async Task SeedAsync_ShouldCreateRoles_WhenTheyDoNotExist()
    {
        using var context = TestDbContextFactory.Create();
        context.Database.EnsureCreated();

        var userManager = MockUserManager();
        var roleManager = MockRoleManager();

        var seeder = new DevelopmentDataSeeder();
        await seeder.SeedAsync(context, userManager.Object, roleManager.Object);

        foreach (var role in AppRoles.All)
        {
            roleManager.Verify(r => r.CreateAsync(
                It.Is<IdentityRole>(ir => ir.Name == role)),
                Times.Once);
        }
    }

    private static Mock<UserManager<AppUser>> MockUserManager()
    {
        var store = new Mock<IUserStore<AppUser>>();
        return new Mock<UserManager<AppUser>>(
            store.Object, null!, null!, null!, null!, null!, null!, null!, null!);
    }

    private static Mock<RoleManager<IdentityRole>> MockRoleManager()
    {
        var store = new Mock<IRoleStore<IdentityRole>>();
        return new Mock<RoleManager<IdentityRole>>(
            store.Object, null!, null!, null!, null!);
    }
}
