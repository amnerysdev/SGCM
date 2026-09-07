using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using SGCM.Application.DTOs.Appointment;
using SGCM.Application.DTOs.Doctor;
using SGCM.Application.DTOs.Patient;
using SGCM.Application.Interfaces;
using SGCM.Domain.Constants;
using SGCM.Domain.Core;
using SGCM.Domain.Enums;

namespace SGCM.Controllers;

[ApiController]
[Authorize]
[Route("api/appointments")]
public class AppointmentController : ControllerBase
{
    private readonly IAppointmentService _appointmentService;
    private readonly IPatientService _patientService;
    private readonly IDoctorService _doctorService;

    public AppointmentController(IAppointmentService appointmentService, IPatientService patientService, IDoctorService doctorService)
    {
        _appointmentService = appointmentService;
        _patientService = patientService;
        _doctorService = doctorService;
    }

    [HttpGet]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> GetAll() => ToActionResult(await _appointmentService.GetAll());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var result = await _appointmentService.GetById(id);
        if (result.Success && !await CanAccessAppointment((AppointmentDto)result.Data!))
            return Forbid();

        return ToActionResult(result);
    }

    [HttpGet("patient/{patientId}")]
    public async Task<IActionResult> GetByPatient(string patientId)
    {
        if (User.IsInRole(AppRoles.Patient) && !await IsCurrentPatient(patientId))
            return Forbid();

        return ToActionResult(await _appointmentService.GetByPatient(patientId));
    }

    [HttpGet("doctor/{doctorId}")]
    public async Task<IActionResult> GetByDoctor(string doctorId)
    {
        if (User.IsInRole(AppRoles.Doctor) && !await IsCurrentDoctor(doctorId))
            return Forbid();

        return ToActionResult(await _appointmentService.GetByDoctor(doctorId));
    }

    [HttpGet("status/{status}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> GetByStatus(AppointmentStatus status) => ToActionResult(await _appointmentService.GetByStatus(status));

    [HttpPost]
    [Authorize(Roles = AppRoles.Patient + "," + AppRoles.Admin)]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentDto dto)
    {
        // A patient may only schedule an appointment for their own profile. Administrators
        // retain the ability to create appointments for a patient selected by their workflow.
        if (User.IsInRole(AppRoles.Patient) && !User.IsInRole(AppRoles.Admin))
        {
            var appUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(appUserId))
                return Unauthorized(new OperationResult { Success = false, Message = "No se pudo identificar al usuario autenticado." });

            var patientResult = await _patientService.GetByAppUserId(appUserId);
            if (!patientResult.Success)
                return BadRequest(new OperationResult { Success = false, Message = "No se encontró un perfil de paciente asociado a tu cuenta." });

            dto.PatientId = ((SGCM.Application.DTOs.Patient.PatientDto)patientResult.Data!).Id;
        }
        var result = await _appointmentService.Create(dto);
        return result.Success ? StatusCode(StatusCodes.Status201Created, result) : BadRequest(result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = AppRoles.Patient + "," + AppRoles.Doctor + "," + AppRoles.Admin)]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateAppointmentDto dto)
    {
        var existing = await _appointmentService.GetById(id);
        if (existing.Success && !await CanAccessAppointment((AppointmentDto)existing.Data!))
            return Forbid();

        dto.Id = id;
        return ToActionResult(await _appointmentService.Update(dto));
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = AppRoles.Doctor + "," + AppRoles.Admin)]
    public async Task<IActionResult> ChangeStatus(string id, [FromBody] ChangeAppointmentStatusDto dto)
    {
        var existing = await _appointmentService.GetById(id);
        if (existing.Success && !await CanAccessAppointment((AppointmentDto)existing.Data!))
            return Forbid();

        dto.Id = id;
        return ToActionResult(await _appointmentService.ChangeStatus(dto));
    }

    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> Cancel(string id)
    {
        var existing = await _appointmentService.GetById(id);
        if (existing.Success && !await CanAccessAppointment((AppointmentDto)existing.Data!))
            return Forbid();

        return ToActionResult(await _appointmentService.ChangeStatus(new ChangeAppointmentStatusDto
        {
            Id = id,
            Status = AppointmentStatus.Canceled
        }));
    }

    private IActionResult ToActionResult(OperationResult result) => result.Success ? Ok(result) : BadRequest(result);

    private async Task<bool> CanAccessAppointment(AppointmentDto appointment)
    {
        if (User.IsInRole(AppRoles.Admin)) return true;
        if (User.IsInRole(AppRoles.Patient)) return await IsCurrentPatient(appointment.PatientId);
        if (User.IsInRole(AppRoles.Doctor)) return await IsCurrentDoctor(appointment.DoctorId);
        return false;
    }

    private async Task<bool> IsCurrentPatient(string patientId)
    {
        var appUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(appUserId)) return false;

        var result = await _patientService.GetByAppUserId(appUserId);
        return result.Success && ((PatientDto)result.Data!).Id == patientId;
    }

    private async Task<bool> IsCurrentDoctor(string doctorId)
    {
        var appUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(appUserId)) return false;

        var result = await _doctorService.GetByAppUserId(appUserId);
        return result.Success && ((DoctorDto)result.Data!).Id == doctorId;
    }
}
