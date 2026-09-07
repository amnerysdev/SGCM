using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using SGCM.Application.DTOs.Availability;
using SGCM.Application.DTOs.Doctor;
using SGCM.Application.Interfaces;
using SGCM.Domain.Constants;
using SGCM.Domain.Core;

namespace SGCM.Controllers;

[ApiController]
[Authorize]
[Route("api/availability")]
public class AvailabilityController : ControllerBase
{
    private readonly IAvailabilityService _availabilityService;
    private readonly IDoctorService _doctorService;

    public AvailabilityController(IAvailabilityService availabilityService, IDoctorService doctorService)
    {
        _availabilityService = availabilityService;
        _doctorService = doctorService;
    }

    [HttpGet]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> GetAll() => ToActionResult(await _availabilityService.GetAll());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id) => ToActionResult(await _availabilityService.GetById(id));

    [HttpGet("doctor/{doctorId}")]
    public async Task<IActionResult> GetByDoctor(string doctorId) => ToActionResult(await _availabilityService.GetByDoctor(doctorId));

    [HttpPost]
    [Authorize(Roles = AppRoles.Doctor + "," + AppRoles.Admin)]
    public async Task<IActionResult> Create([FromBody] CreateAvailabilityDto dto)
    {
        if (User.IsInRole(AppRoles.Doctor) && !await IsCurrentDoctor(dto.DoctorId))
            return Forbid();

        var result = await _availabilityService.Create(dto);
        return result.Success ? StatusCode(StatusCodes.Status201Created, result) : BadRequest(result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = AppRoles.Doctor + "," + AppRoles.Admin)]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateAvailabilityDto dto)
    {
        if (User.IsInRole(AppRoles.Doctor))
        {
            var existing = await _availabilityService.GetById(id);
            if (!existing.Success || !await IsCurrentDoctor(((AvailabilityDto)existing.Data!).DoctorId))
                return Forbid();
        }

        dto.Id = id;
        return ToActionResult(await _availabilityService.Update(dto));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = AppRoles.Doctor + "," + AppRoles.Admin)]
    public async Task<IActionResult> Delete(string id)
    {
        if (User.IsInRole(AppRoles.Doctor))
        {
            var existing = await _availabilityService.GetById(id);
            if (!existing.Success || !await IsCurrentDoctor(((AvailabilityDto)existing.Data!).DoctorId))
                return Forbid();
        }

        return ToActionResult(await _availabilityService.Delete(id));
    }

    private async Task<bool> IsCurrentDoctor(string doctorId)
    {
        var appUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(appUserId)) return false;

        var result = await _doctorService.GetByAppUserId(appUserId);
        return result.Success && ((DoctorDto)result.Data!).Id == doctorId;
    }

    private IActionResult ToActionResult(OperationResult result) => result.Success ? Ok(result) : BadRequest(result);
}
