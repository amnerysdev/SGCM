using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SGCM.Data.Context;
using SGCM.Data.Seeding;
using SGCM.Domain.Entities;

namespace SGCM.Data;

public static class MigrationExtensions
{
    public static void ApplyMigrations(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        using var context = scope.ServiceProvider.GetRequiredService<SgcmDbContext>();

        if (!context.Database.IsInMemory() && Environment.GetEnvironmentVariable("RUN_MIGRATIONS") != "true")
            return;

        try
        {
            if (context.Database.IsInMemory())
            {
                Console.WriteLine("Inicializando base de datos en memoria.");
                context.Database.EnsureCreated();
            }
            else
            {
                Console.WriteLine("Aplicando migraciones.");
                context.Database.Migrate();
            }

            Console.WriteLine("Base de datos lista.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al preparar la base de datos: {ex.Message}");
        }
    }

    public static async Task SeedTestDataAsync(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var services = scope.ServiceProvider;
        var context = services.GetRequiredService<SgcmDbContext>();
        var userManager = services.GetRequiredService<UserManager<AppUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        await new DevelopmentDataSeeder().SeedAsync(context, userManager, roleManager);
    }
}
