using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using SGCM.Data.Context;
using SGCM.Data.Seeding;
using SGCM.Domain.Entities;

namespace SGCM.Data;

public static class MigrationExtensions
{
    public static void ApplyMigrations(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("SGCM.Data.Migrations");
        using var context = scope.ServiceProvider.GetRequiredService<SgcmDbContext>();

        if (!context.Database.IsInMemory() && Environment.GetEnvironmentVariable("RUN_MIGRATIONS") != "true")
            return;

        try
        {
            if (context.Database.IsInMemory())
            {
                logger.LogInformation("Inicializando base de datos en memoria.");
                context.Database.EnsureCreated();
            }
            else
            {
                logger.LogInformation("Aplicando migraciones.");
                context.Database.Migrate();
            }

            logger.LogInformation("Base de datos lista.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error al preparar la base de datos: {Message}", ex.Message);
        }
    }

    public static async Task SeedTestDataAsync(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var services = scope.ServiceProvider;
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("SGCM.Data.Seeding");
        var context = services.GetRequiredService<SgcmDbContext>();
        var userManager = services.GetRequiredService<UserManager<AppUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        await new DevelopmentDataSeeder().SeedAsync(context, userManager, roleManager, logger);
    }
}
