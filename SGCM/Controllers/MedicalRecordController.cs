using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using SGCM.Application.DTOs.Doctor;
using SGCM.Application.DTOs.MedicalRecord;
using SGCM.Application.DTOs.Patient;
using SGCM.Application.Interfaces;
using SGCM.Domain.Constants;
using SGCM.Domain.Core;

namespace SGCM.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/medical-records")]
    public class MedicalRecordController : ControllerBase
    {
        private readonly IMedicalRecordService _medicalRecordService;
        private readonly IPatientService _patientService;
        private readonly IDoctorService _doctorService;

        public MedicalRecordController(IMedicalRecordService medicalRecordService, IPatientService patientService, IDoctorService doctorService)
        {
            _medicalRecordService = medicalRecordService;
            _patientService = patientService;
            _doctorService = doctorService;
        }

        [HttpGet]
        [Authorize(Roles = AppRoles.Admin)]
        public async Task<IActionResult> GetAll()
        {
            var result = await _medicalRecordService.GetAll();
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var result = await _medicalRecordService.GetById(id);
            if (result.Success && User.IsInRole(AppRoles.Patient) && !await IsCurrentPatient(((MedicalRecordDto)result.Data!).PatientId))
                return Forbid();

            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpGet("patient/{patientId}")]
        public async Task<IActionResult> GetByPatient(string patientId)
        {
            if (User.IsInRole(AppRoles.Patient) && !await IsCurrentPatient(patientId))
                return Forbid();

            var result = await _medicalRecordService.GetByPatient(patientId);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpGet("appointment/{appointmentId}")]
        public async Task<IActionResult> GetByAppointment(string appointmentId)
        {
            var result = await _medicalRecordService.GetByAppointment(appointmentId);
            if (result.Success && User.IsInRole(AppRoles.Patient))
            {
                var records = (IEnumerable<MedicalRecordDto>)result.Data!;
                foreach (var record in records)
                {
                    if (!await IsCurrentPatient(record.PatientId))
                        return Forbid();
                }
            }

            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPost]
        [Authorize(Roles = AppRoles.Doctor + "," + AppRoles.Admin)]
        public async Task<IActionResult> Create(
            [FromBody] CreateMedicalRecordDto dto)
        {
            if (User.IsInRole(AppRoles.Doctor) && !await IsCurrentDoctor(dto.DoctorId))
                return Forbid();

            var result = await _medicalRecordService.Create(dto);

            if (!result.Success)
                return BadRequest(result);

            var medicalRecord = (MedicalRecordDto)result.Data!;

            return CreatedAtAction(
                nameof(GetById),
                new { id = medicalRecord.Id },
                result
            );
        }

        [HttpPut("{id}")]
        [Authorize(Roles = AppRoles.Doctor + "," + AppRoles.Admin)]
        public async Task<IActionResult> Update(
            string id,
            [FromBody] UpdateMedicalRecordDto dto)
        {
            if (User.IsInRole(AppRoles.Doctor))
            {
                var existing = await _medicalRecordService.GetById(id);
                if (!existing.Success || !await IsCurrentDoctor(((MedicalRecordDto)existing.Data!).DoctorId))
                    return Forbid();
            }

            dto.Id = id;

            var result = await _medicalRecordService.Update(dto);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = AppRoles.Admin)]
        public async Task<IActionResult> Delete(string id)
        {
            var result = await _medicalRecordService.Delete(id);

            return result.Success ? Ok(result) : NotFound(result);
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
}
