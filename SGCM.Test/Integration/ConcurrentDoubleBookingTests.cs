using Microsoft.AspNetCore.Identity;
using Moq;
using SGCM.Application.DTOs.Appointment;
using SGCM.Application.DTOs.Availability;
using SGCM.Application.Services;
using SGCM.Data.Context;
using SGCM.Application.Abstractions;
using SGCM.Data.Repositories;
using SGCM.Domain.Entities;
using SGCM.Domain.Enums;
using SGCM.Test.Common;
using Xunit;

namespace SGCM.Test.Integration;

public class ConcurrentDoubleBookingTests
{
    [Fact]
    public async Task ConcurrentAppointmentCreation_ShouldAllowOnlyOneSuccess()
    {
        using var context = TestDbContextFactory.Create();
        await SeedProfiles(context);
        var availabilityService = CreateAvailabilityService(context);
        var appointmentService = CreateAppointmentService(context);
        var appointmentTime = NextMondayAt(9);

        Assert.True((await availabilityService.Create(new CreateAvailabilityDto
        {
            DoctorId = "doctor-1",
            Day = AvailableDay.Monday,
            StartTime = TimeSpan.FromHours(8),
            EndTime = TimeSpan.FromHours(12)
        })).Success);

        var tasks = new[]
        {
            appointmentService.Create(new CreateAppointmentDto
            {
                PatientId = "patient-1",
                DoctorId = "doctor-1",
                DateTime = appointmentTime,
                Reason = "Concurrent A"
            }),
            appointmentService.Create(new CreateAppointmentDto
            {
                PatientId = "patient-2",
                DoctorId = "doctor-1",
                DateTime = appointmentTime,
                Reason = "Concurrent B"
            })
        };

        var results = await Task.WhenAll(tasks);
        var successCount = results.Count(r => r.Success);

        Assert.Equal(1, successCount);
        Assert.Single(context.Appointments);
    }

    [Fact]
    public async Task ConcurrentAppointmentCreation_ShouldAllowDifferentSlots()
    {
        using var context = TestDbContextFactory.Create();
        await SeedProfiles(context);
        var availabilityService = CreateAvailabilityService(context);
        var appointmentService = CreateAppointmentService(context);

        Assert.True((await availabilityService.Create(new CreateAvailabilityDto
        {
            DoctorId = "doctor-1",
            Day = AvailableDay.Monday,
            StartTime = TimeSpan.FromHours(8),
            EndTime = TimeSpan.FromHours(12)
        })).Success);

        var tasks = new[]
        {
            appointmentService.Create(new CreateAppointmentDto
            {
                PatientId = "patient-1",
                DoctorId = "doctor-1",
                DateTime = NextMondayAt(8),
                Reason = "Slot 8am"
            }),
            appointmentService.Create(new CreateAppointmentDto
            {
                PatientId = "patient-2",
                DoctorId = "doctor-1",
                DateTime = NextMondayAt(9),
                Reason = "Slot 9am"
            }),
            appointmentService.Create(new CreateAppointmentDto
            {
                PatientId = "patient-1",
                DoctorId = "doctor-1",
                DateTime = NextMondayAt(10),
                Reason = "Slot 10am"
            })
        };

        var results = await Task.WhenAll(tasks);

        Assert.All(results, r => Assert.True(r.Success));
        Assert.Equal(3, context.Appointments.Count());
    }

    private static AvailabilityService CreateAvailabilityService(SgcmDbContext context) =>
        new(new AvailabilityRepository(context), new DoctorRepository(context));

    private static AppointmentService CreateAppointmentService(SgcmDbContext context)
    {
        var store = new Mock<IUserStore<AppUser>>();
        var userManager = new Mock<UserManager<AppUser>>(store.Object, null!, null!, null!, null!, null!, null!, null!, null!);
        var emailSender = new Mock<IEmailSender>();

        return new AppointmentService(
            new AppointmentRepository(context),
            new DoctorRepository(context),
            new PatientRepository(context),
            new AvailabilityRepository(context),
            userManager.Object,
            emailSender.Object);
    }

    private static async Task SeedProfiles(SgcmDbContext context)
    {
        context.Doctors.Add(new Doctor { Id = "doctor-1", MedicalLicense = "MED-001", AppUserId = "doctor-user", SpecialtyId = "specialty-1" });
        context.Patients.AddRange(
            new Patient { Id = "patient-1", AppUserId = "patient-user-1", SocialSecurityNumber = "001", Address = "Direccion 1", DateOfBirth = new DateTime(1990, 1, 1) },
            new Patient { Id = "patient-2", AppUserId = "patient-user-2", SocialSecurityNumber = "002", Address = "Direccion 2", DateOfBirth = new DateTime(1992, 1, 1) });
        await context.SaveChangesAsync();
    }

    private static DateTime NextMondayAt(int hour)
    {
        var today = DateTime.UtcNow.Date;
        var daysUntilMonday = ((int)DayOfWeek.Monday - (int)today.DayOfWeek + 7) % 7;
        if (daysUntilMonday == 0) daysUntilMonday = 7;
        return today.AddDays(daysUntilMonday).AddHours(hour);
    }
}
