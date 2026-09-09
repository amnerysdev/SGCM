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

public class AppointmentLifecycleTests
{
    [Fact]
    public async Task FullLifecycle_ShouldFollowPendingToCompleted()
    {
        using var context = TestDbContextFactory.Create();
        await SeedProfiles(context);
        var availabilityService = CreateAvailabilityService(context);
        var appointmentService = CreateAppointmentService(context);
        var appointmentTime = NextMondayAt(9);

        await availabilityService.Create(new CreateAvailabilityDto
        {
            DoctorId = "doctor-1",
            Day = AvailableDay.Monday,
            StartTime = TimeSpan.FromHours(8),
            EndTime = TimeSpan.FromHours(12)
        });

        var created = await appointmentService.Create(new CreateAppointmentDto
        {
            PatientId = "patient-1",
            DoctorId = "doctor-1",
            DateTime = appointmentTime,
            Reason = "Consulta inicial"
        });
        Assert.True(created.Success);
        var appointment = (AppointmentDto)created.Data!;
        Assert.Equal(AppointmentStatus.Pending, appointment.Status);

        var confirmed = await appointmentService.ChangeStatus(new ChangeAppointmentStatusDto
        {
            Id = appointment.Id,
            Status = AppointmentStatus.Confirmed
        });
        Assert.True(confirmed.Success);
        Assert.Equal(AppointmentStatus.Confirmed, ((AppointmentDto)confirmed.Data!).Status);

        var completed = await appointmentService.ChangeStatus(new ChangeAppointmentStatusDto
        {
            Id = appointment.Id,
            Status = AppointmentStatus.Completed
        });
        Assert.True(completed.Success);
        Assert.Equal(AppointmentStatus.Completed, ((AppointmentDto)completed.Data!).Status);
    }

    [Fact]
    public async Task CompletedAppointment_ShouldNotAllowFurtherTransitions()
    {
        using var context = TestDbContextFactory.Create();
        await SeedProfiles(context);
        var availabilityService = CreateAvailabilityService(context);
        var appointmentService = CreateAppointmentService(context);
        var appointmentTime = NextMondayAt(10);

        await availabilityService.Create(new CreateAvailabilityDto
        {
            DoctorId = "doctor-1",
            Day = AvailableDay.Monday,
            StartTime = TimeSpan.FromHours(8),
            EndTime = TimeSpan.FromHours(12)
        });

        var created = await appointmentService.Create(new CreateAppointmentDto
        {
            PatientId = "patient-1",
            DoctorId = "doctor-1",
            DateTime = appointmentTime,
            Reason = "Control"
        });
        var appointmentId = ((AppointmentDto)created.Data!).Id;

        await appointmentService.ChangeStatus(new ChangeAppointmentStatusDto
        {
            Id = appointmentId,
            Status = AppointmentStatus.Confirmed
        });

        await appointmentService.ChangeStatus(new ChangeAppointmentStatusDto
        {
            Id = appointmentId,
            Status = AppointmentStatus.Completed
        });

        var afterCompleted = await appointmentService.ChangeStatus(new ChangeAppointmentStatusDto
        {
            Id = appointmentId,
            Status = AppointmentStatus.Canceled
        });
        Assert.False(afterCompleted.Success);
        Assert.Equal("No se permite cambiar la cita a ese estado.", afterCompleted.Message);
    }

    [Fact]
    public async Task PendingToCanceledToRebooked_ShouldWork()
    {
        using var context = TestDbContextFactory.Create();
        await SeedProfiles(context);
        var availabilityService = CreateAvailabilityService(context);
        var appointmentService = CreateAppointmentService(context);
        var appointmentTime = NextMondayAt(11);

        await availabilityService.Create(new CreateAvailabilityDto
        {
            DoctorId = "doctor-1",
            Day = AvailableDay.Monday,
            StartTime = TimeSpan.FromHours(8),
            EndTime = TimeSpan.FromHours(12)
        });

        var first = await appointmentService.Create(new CreateAppointmentDto
        {
            PatientId = "patient-1",
            DoctorId = "doctor-1",
            DateTime = appointmentTime,
            Reason = "Primera cita"
        });
        var firstId = ((AppointmentDto)first.Data!).Id;

        var canceled = await appointmentService.ChangeStatus(new ChangeAppointmentStatusDto
        {
            Id = firstId,
            Status = AppointmentStatus.Canceled
        });
        Assert.True(canceled.Success);

        var rebooked = await appointmentService.Create(new CreateAppointmentDto
        {
            PatientId = "patient-2",
            DoctorId = "doctor-1",
            DateTime = appointmentTime,
            Reason = "Reprogramada"
        });
        Assert.True(rebooked.Success);
        Assert.Equal(AppointmentStatus.Pending, ((AppointmentDto)rebooked.Data!).Status);
    }

    [Fact]
    public async Task InvalidTransitions_ShouldBeRejected()
    {
        using var context = TestDbContextFactory.Create();
        await SeedProfiles(context);
        var availabilityService = CreateAvailabilityService(context);
        var appointmentService = CreateAppointmentService(context);
        var appointmentTime = NextMondayAt(8);

        await availabilityService.Create(new CreateAvailabilityDto
        {
            DoctorId = "doctor-1",
            Day = AvailableDay.Monday,
            StartTime = TimeSpan.FromHours(8),
            EndTime = TimeSpan.FromHours(12)
        });

        var created = await appointmentService.Create(new CreateAppointmentDto
        {
            PatientId = "patient-1",
            DoctorId = "doctor-1",
            DateTime = appointmentTime,
            Reason = "Test"
        });
        var appointmentId = ((AppointmentDto)created.Data!).Id;

        var pendingToCompleted = await appointmentService.ChangeStatus(new ChangeAppointmentStatusDto
        {
            Id = appointmentId,
            Status = AppointmentStatus.Completed
        });
        Assert.False(pendingToCompleted.Success);

        var pendingToPending = await appointmentService.ChangeStatus(new ChangeAppointmentStatusDto
        {
            Id = appointmentId,
            Status = AppointmentStatus.Pending
        });
        Assert.False(pendingToPending.Success);
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
