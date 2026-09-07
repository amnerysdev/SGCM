using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SGCM.Data.Context;
using SGCM.Domain.Constants;
using SGCM.Domain.Entities;
using SGCM.Domain.Enums;

namespace SGCM.Data.Seeding;

public sealed class DevelopmentDataSeeder
{
    public async Task SeedAsync(SgcmDbContext context, UserManager<AppUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        if (!context.Database.IsInMemory() && Environment.GetEnvironmentVariable("RUN_SEED") != "true") return;

        try
        {
            Console.WriteLine("Sembrando datos de prueba.");

            foreach (var role in AppRoles.All)
            {
                if (!await roleManager.RoleExistsAsync(role))
                    await roleManager.CreateAsync(new IdentityRole(role));
            }

            await CreateTestUserAsync(userManager, "admin@sgcm.com", "AdminDemo2026!", "Administrador de Prueba", AppRoles.Admin);

            var doctorUser = await CreateTestUserAsync(userManager, "doctor@sgcm.com", "DoctorDemo2026!", "Doctor de Prueba", AppRoles.Doctor);
            if (doctorUser is not null && !context.Doctors.Any(d => d.AppUserId == doctorUser.Id))
            {
                var specialty = context.Specialties.FirstOrDefault();
                if (specialty is null)
                {
                    specialty = new Specialty { Name = "Medicina General", Description = "Especialidad general de prueba" };
                    context.Specialties.Add(specialty);
                    await context.SaveChangesAsync();
                }

                context.Doctors.Add(new Doctor
                {
                    AppUserId = doctorUser.Id,
                    SpecialtyId = specialty.Id,
                    MedicalLicense = "TEST-0001"
                });
            }

            var patientUser = await CreateTestUserAsync(userManager, "patient@sgcm.com", "PatientDemo2026!", "Paciente de Prueba", AppRoles.Patient);
            if (patientUser is not null && !context.Patients.Any(p => p.AppUserId == patientUser.Id))
            {
                context.Patients.Add(new Patient
                {
                    AppUserId = patientUser.Id,
                    SocialSecurityNumber = "000-0000000-0",
                    DateOfBirth = new DateTime(1995, 1, 1),
                    Address = "Direccion de prueba"
                });
            }

            await context.SaveChangesAsync();
            await SeedRealisticTestDataAsync(context, userManager);

            Console.WriteLine("Datos de prueba sembrados con exito.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al sembrar datos de prueba: {ex.Message}");
        }
    }

    private static async Task<AppUser?> CreateTestUserAsync(
        UserManager<AppUser> userManager, string email, string password, string fullName, string role)
    {
        var existing = await userManager.FindByEmailAsync(email);
        if (existing is not null) return existing;

        var user = new AppUser
        {
            UserName = email,
            Email = email,
            FullName = fullName,
            EmailConfirmed = true,
            IsActive = true
        };

        var result = await userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            Console.WriteLine($"No se pudo crear el usuario de prueba {email}: {string.Join(" ", result.Errors.Select(e => e.Description))}");
            return null;
        }

        await userManager.AddToRoleAsync(user, role);
        return user;
    }

    private static async Task SeedRealisticTestDataAsync(SgcmDbContext context, UserManager<AppUser> userManager)
    {
        var specialties = new[]
        {
            ("Medicina Familiar", "Atención médica integral para pacientes de todas las edades."),
            ("Cardiología", "Prevención, diagnóstico y seguimiento cardiovascular."),
            ("Pediatría", "Atención clínica para niños, niñas y adolescentes."),
            ("Dermatología", "Diagnóstico y tratamiento de condiciones de la piel."),
            ("Ginecología", "Salud preventiva y atención integral de la mujer."),
            ("Nutrición Clínica", "Orientación nutricional personalizada y preventiva.")
        };

        foreach (var (name, description) in specialties)
        {
            if (!await context.Specialties.AnyAsync(s => s.Name == name))
                context.Specialties.Add(new Specialty { Name = name, Description = description });
        }
        await context.SaveChangesAsync();

        var specialtyByName = await context.Specialties.ToDictionaryAsync(s => s.Name, s => s.Id);
        var doctors = new[]
        {
            ("Dra. Elena Valverde", "elena.valverde@example.test", "809-555-0101", "MED-FIC-1001", "Medicina Familiar"),
            ("Dr. Mateo Rivas", "mateo.rivas@example.test", "809-555-0102", "MED-FIC-1002", "Cardiología"),
            ("Dra. Sofía Mena", "sofia.mena@example.test", "809-555-0103", "MED-FIC-1003", "Pediatría"),
            ("Dr. Adrián Paredes", "adrian.paredes@example.test", "809-555-0104", "MED-FIC-1004", "Dermatología"),
            ("Dra. Lucía Tejada", "lucia.tejada@example.test", "809-555-0105", "MED-FIC-1005", "Ginecología"),
            ("Dra. Camila Peralta", "camila.peralta@example.test", "809-555-0106", "MED-FIC-1006", "Nutrición Clínica")
        };
        foreach (var (fullName, email, phone, license, specialty) in doctors)
        {
            var user = await CreateTestUserAsync(userManager, email, $"Fictitious-{Guid.NewGuid():N}-Aa!", fullName, AppRoles.Doctor);
            if (user is not null && !await context.Doctors.AnyAsync(d => d.AppUserId == user.Id))
                context.Doctors.Add(new Doctor { AppUserId = user.Id, MedicalLicense = license, SpecialtyId = specialtyByName[specialty] });
            if (user is not null) { user.PhoneNumber = phone; await userManager.UpdateAsync(user); }
        }

        var administrators = new[]
        {
            ("Clara Domínguez", "clara.dominguez@example.test", "809-555-0301"),
            ("Bruno M. Castillo", "bruno.castillo@example.test", "809-555-0302"),
            ("Natalia Figueroa", "natalia.figueroa@example.test", "809-555-0303")
        };
        foreach (var (fullName, email, phone) in administrators)
        {
            var user = await CreateTestUserAsync(userManager, email, $"Fictitious-{Guid.NewGuid():N}-Aa!", fullName, AppRoles.Admin);
            if (user is not null) { user.PhoneNumber = phone; await userManager.UpdateAsync(user); }
        }

        var patients = new[]
        {
            ("Marina Alcántara", "marina.alcantara@example.test", "809-555-0201", "900-0100001-1", new DateTime(1988, 5, 14), "Calle Jardines 18, Santo Domingo"),
            ("Diego Montilla", "diego.montilla@example.test", "809-555-0202", "900-0100002-9", new DateTime(1979, 11, 3), "Av. Mirador 42, Santiago"),
            ("Valentina Sosa", "valentina.sosa@example.test", "809-555-0203", "900-0100003-7", new DateTime(1993, 2, 21), "Calle Palma 7, La Vega"),
            ("Gabriel Lora", "gabriel.lora@example.test", "809-555-0204", "900-0100004-5", new DateTime(2001, 8, 9), "Residencial Norte 15, Santo Domingo"),
            ("Inés Cabrera", "ines.cabrera@example.test", "809-555-0205", "900-0100005-3", new DateTime(1985, 6, 30), "Calle Lirio 30, Baní"),
            ("Tomás Arvelo", "tomas.arvelo@example.test", "809-555-0206", "900-0100006-1", new DateTime(1968, 1, 17), "Av. Central 201, San Cristóbal"),
            ("Renata Bello", "renata.bello@example.test", "809-555-0207", "900-0100007-9", new DateTime(1996, 9, 25), "Calle Sol 14, Puerto Plata"),
            ("Héctor Nolasco", "hector.nolasco@example.test", "809-555-0208", "900-0100008-7", new DateTime(1974, 4, 12), "Calle Arena 9, Higüey")
        };
        foreach (var (fullName, email, phone, socialSecurityNumber, birthDate, address) in patients)
        {
            var user = await CreateTestUserAsync(userManager, email, "PacienteDemo2026!", fullName, AppRoles.Patient);
            if (user is not null && !await context.Patients.AnyAsync(p => p.AppUserId == user.Id))
                context.Patients.Add(new Patient { AppUserId = user.Id, SocialSecurityNumber = socialSecurityNumber, DateOfBirth = birthDate, Address = address });
            if (user is not null) { user.PhoneNumber = phone; await userManager.UpdateAsync(user); }
        }
        await context.SaveChangesAsync();

        var seededDoctors = await context.Doctors.Where(d => d.MedicalLicense.StartsWith("MED-FIC-")).OrderBy(d => d.MedicalLicense).ToListAsync();
        var seededPatients = await context.Patients.Where(p => p.SocialSecurityNumber.StartsWith("900-")).OrderBy(p => p.SocialSecurityNumber).ToListAsync();
        foreach (var doctor in seededDoctors)
        {
            for (var day = AvailableDay.Monday; day <= AvailableDay.Friday; day++)
            {
                if (!await context.Availabilities.AnyAsync(a => a.DoctorId == doctor.Id && a.Day == day))
                    context.Availabilities.Add(new Availability { DoctorId = doctor.Id, Day = day, StartTime = new TimeSpan(8, 0, 0), EndTime = new TimeSpan(16, 0, 0) });
            }
        }

        var reasons = new[] { "Consulta de seguimiento", "Evaluación preventiva", "Revisión de resultados", "Control de tratamiento", "Consulta general", "Orientación clínica" };
        var statuses = new[] { AppointmentStatus.Pending, AppointmentStatus.Confirmed, AppointmentStatus.Completed, AppointmentStatus.Canceled };
        var start = DateTime.Today.AddDays(-9).AddHours(9);
        for (var index = 0; index < 24; index++)
        {
            var patient = seededPatients[index % seededPatients.Count];
            var doctor = seededDoctors[index % seededDoctors.Count];
            var date = start.AddDays(index).AddMinutes((index % 5) * 30);
            if (!await context.Appointments.AnyAsync(a => a.PatientId == patient.Id && a.DoctorId == doctor.Id && a.DateTime == date))
                context.Appointments.Add(new Appointment { PatientId = patient.Id, DoctorId = doctor.Id, DateTime = date, Reason = reasons[index % reasons.Length], Status = statuses[index % statuses.Length] });
        }
        await context.SaveChangesAsync();
    }
}
