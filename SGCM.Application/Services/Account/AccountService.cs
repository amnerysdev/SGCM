using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using SGCM.Application.DTOs.Account;
using SGCM.Application.Interfaces;
using SGCM.Data.Interfaces;
using SGCM.Data.Validation;
using SGCM.Domain.Constants;
using SGCM.Domain.Core;
using SGCM.Domain.Entities;
using SGCM.Domain.Settings;
using System.Net.Mail;
using System.Text.RegularExpressions;

namespace SGCM.Application.Services
{
    public class AccountService : IAccountService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IJwtTokenGenerator _tokenGenerator;
        private readonly IEmailSender _emailSender;
        private readonly FrontendSettings _frontendSettings;

        public AccountService(
            UserManager<AppUser> userManager,
            IJwtTokenGenerator tokenGenerator,
            IEmailSender emailSender,
            IOptions<FrontendSettings> frontendSettings)
        {
            _userManager = userManager;
            _tokenGenerator = tokenGenerator;
            _emailSender = emailSender;
            _frontendSettings = frontendSettings.Value;
        }

        public async Task<OperationResult> Register(RegisterRequestDto dto)
        {
            if (dto is null)
                return new OperationResult { Success = false, Message = "Los datos de registro no pueden estar vacíos." };
            if (string.IsNullOrWhiteSpace(dto.FullName))
                return new OperationResult { Success = false, Message = "El nombre completo no puede estar vacío." };
            if (string.IsNullOrWhiteSpace(dto.Email))
                return new OperationResult { Success = false, Message = "El correo electrónico no puede estar vacío." };
            if (!IsValidEmail(dto.Email))
                return new OperationResult { Success = false, Message = "Ingresa un correo electrónico válido." };
            var phoneValidationMessage = GetDominicanPhoneValidationMessage(dto.PhoneNumber, out var normalizedPhone);
            if (phoneValidationMessage is not null)
                return new OperationResult { Success = false, Message = phoneValidationMessage };
            if (string.IsNullOrWhiteSpace(dto.Password))
                return new OperationResult { Success = false, Message = "La contraseña no puede estar vacía." };
            if (!RegistroValidator.PasswordsMatch(dto.Password, dto.ConfirmPassword))
                return new OperationResult { Success = false, Message = "Las contraseñas no coinciden." };
            var passwordValidationMessage = GetPasswordValidationMessage(dto.Password);
            if (passwordValidationMessage is not null)
                return new OperationResult { Success = false, Message = passwordValidationMessage };
            if (!AppRoles.SelfRegisterable.Contains(dto.Role))
                return new OperationResult { Success = false, Message = "El rol especificado no es válido." };

            var email = dto.Email.Trim();
            var existingUser = await _userManager.FindByEmailAsync(email);
            if (existingUser is not null)
                return new OperationResult { Success = false, Message = "Ya existe una cuenta con ese correo electrónico." };

            var user = new AppUser
            {
                UserName = email,
                Email = email,
                PhoneNumber = normalizedPhone,
                FullName = dto.FullName.Trim(),
                // Mientras se usa el almacén en memoria no existe confirmación por correo.
                // La cuenta queda habilitada para que el usuario pueda iniciar sesión.
                EmailConfirmed = true
            };

            var createResult = await _userManager.CreateAsync(user, dto.Password);
            if (!createResult.Succeeded)
            {
                var errors = string.Join(" ", createResult.Errors.Select(e => e.Description));
                return new OperationResult { Success = false, Message = errors };
            }

            var roleResult = await _userManager.AddToRoleAsync(user, dto.Role);
            if (!roleResult.Succeeded)
            {
                await _userManager.DeleteAsync(user);
                var errors = string.Join(" ", roleResult.Errors.Select(e => e.Description));
                return new OperationResult { Success = false, Message = errors };
            }

            return new OperationResult
            {
                Success = true,
                Message = "Tu cuenta fue creada correctamente. Ya puedes iniciar sesión."
            };
        }

        public async Task<OperationResult> ConfirmEmail(string userId, string token)
        {
            if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(token))
                return new OperationResult { Success = false, Message = "Enlace de confirmación inválido." };

            var user = await _userManager.FindByIdAsync(userId);
            if (user is null)
                return new OperationResult { Success = false, Message = "Usuario no encontrado." };

            if (user.EmailConfirmed)
                return new OperationResult { Success = true, Message = "El correo ya había sido confirmado." };

            var result = await _userManager.ConfirmEmailAsync(user, token);
            if (!result.Succeeded)
            {
                var errors = string.Join(" ", result.Errors.Select(e => e.Description));
                return new OperationResult { Success = false, Message = $"No se pudo confirmar el correo: {errors}" };
            }

            return new OperationResult { Success = true, Message = "Correo confirmado exitosamente. Ya puedes iniciar sesión." };
        }

        public async Task<OperationResult> ForgotPassword(ForgotPasswordRequestDto dto)
        {
            const string genericMessage = "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.";

            if (dto is null || string.IsNullOrWhiteSpace(dto.Email))
                return new OperationResult { Success = false, Message = "El correo electrónico no puede estar vacío." };
            if (!IsValidEmail(dto.Email))
                return new OperationResult { Success = false, Message = "Ingresa un correo electrónico válido." };

            var user = await _userManager.FindByEmailAsync(dto.Email.Trim());
            if (user is null || !user.IsActive || !user.EmailConfirmed)
                return new OperationResult { Success = true, Message = genericMessage };

            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            var resetLink = $"{_frontendSettings.BaseUrl}/reset-password.html?userId={user.Id}&token={Uri.EscapeDataString(resetToken)}";

            try
            {
                await _emailSender.SendEmailAsync(
                    user.Email!,
                    "Restablece tu contraseña - SGCM",
                    $"<p>Hola {user.FullName},</p>" +
                    $"<p>Recibimos una solicitud para restablecer tu contraseña. Si fuiste tú, haz clic en el siguiente enlace:</p>" +
                    $"<p><a href=\"{resetLink}\">Restablecer mi contraseña</a></p>" +
                    $"<p>Si no solicitaste este cambio, puedes ignorar este correo.</p>");
            }
            catch
            {
                // No se revela si el envío falló para no filtrar si la cuenta existe.
            }

            return new OperationResult { Success = true, Message = genericMessage };
        }

        public async Task<OperationResult> ResetPassword(ResetPasswordRequestDto dto)
        {
            if (dto is null || string.IsNullOrWhiteSpace(dto.UserId) || string.IsNullOrWhiteSpace(dto.Token))
                return new OperationResult { Success = false, Message = "Enlace de restablecimiento inválido." };
            if (string.IsNullOrWhiteSpace(dto.NewPassword))
                return new OperationResult { Success = false, Message = "La contraseña no puede estar vacía." };
            if (!RegistroValidator.PasswordsMatch(dto.NewPassword, dto.ConfirmPassword))
                return new OperationResult { Success = false, Message = "Las contraseñas no coinciden." };
            var passwordValidationMessage = GetPasswordValidationMessage(dto.NewPassword);
            if (passwordValidationMessage is not null)
                return new OperationResult { Success = false, Message = passwordValidationMessage };

            var user = await _userManager.FindByIdAsync(dto.UserId);
            if (user is null)
                return new OperationResult { Success = false, Message = "Enlace de restablecimiento inválido." };

            var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
            if (!result.Succeeded)
            {
                var errors = string.Join(" ", result.Errors.Select(e => e.Description));
                return new OperationResult { Success = false, Message = $"No se pudo restablecer la contraseña: {errors}" };
            }

            return new OperationResult { Success = true, Message = "Tu contraseña fue restablecida exitosamente. Ya puedes iniciar sesión." };
        }

        public async Task<OperationResult> Login(LoginRequestDto dto)
        {
            if (dto is null || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return new OperationResult { Success = false, Message = "Credenciales inválidas." };
            if (!IsValidEmail(dto.Email))
                return new OperationResult { Success = false, Message = "Credenciales inválidas." };

            var user = await _userManager.FindByEmailAsync(dto.Email.Trim());
            if (user is null)
                return new OperationResult { Success = false, Message = "Credenciales inválidas." };

            if (user.LockoutEnabled && await _userManager.IsLockedOutAsync(user))
                return new OperationResult { Success = false, Message = "Credenciales inválidas." };

            var passwordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
            if (!passwordValid)
            {
                if (user.LockoutEnabled)
                    await _userManager.AccessFailedAsync(user);
                return new OperationResult { Success = false, Message = "Credenciales inválidas." };
            }

            if (user.LockoutEnabled)
                await _userManager.ResetAccessFailedCountAsync(user);

            if (!user.EmailConfirmed)
                return new OperationResult { Success = false, Message = "Debes confirmar tu correo electrónico antes de iniciar sesión." };

            if (!user.IsActive)
                return new OperationResult { Success = false, Message = "La cuenta está inactiva." };

            var roles = await _userManager.GetRolesAsync(user);
            var (token, expiration) = _tokenGenerator.GenerateToken(user, roles);

            return new OperationResult
            {
                Success = true,
                Data = ToAuthResponse(user, roles.ToList(), token, expiration)
            };
        }

        private static AuthenticationResponseDto ToAuthResponse(AppUser user, List<string> roles, string token, DateTime expiration) => new()
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email ?? string.Empty,
            IsActive = user.IsActive,
            Roles = roles,
            JWToken = token,
            Expiration = expiration
        };

        private static bool IsValidEmail(string email)
        {
            try
            {
                var address = new MailAddress(email.Trim());
                return address.Address.Equals(email.Trim(), StringComparison.OrdinalIgnoreCase);
            }
            catch (FormatException)
            {
                return false;
            }
        }

        private static string? GetDominicanPhoneValidationMessage(string? phone, out string normalizedPhone)
        {
            normalizedPhone = string.Empty;
            var value = phone?.Trim() ?? string.Empty;
            if (value.Length == 0) return "El teléfono es obligatorio.";
            if (!Regex.IsMatch(value, @"^\+?[0-9() .-]+$") || (value.Contains('+') && !value.StartsWith('+')))
                return "Usa solo dígitos; se permiten espacios, guiones, paréntesis y el prefijo +1.";

            var hasCountryCode = value.StartsWith('+');
            var digits = Regex.Replace(value, "[^0-9]", string.Empty);
            if (hasCountryCode)
            {
                if (!digits.StartsWith('1')) return "El único código de país admitido es +1.";
                digits = digits[1..];
            }

            if (digits.Length != 10) return "Ingresa un número dominicano de 10 dígitos, con o sin el prefijo +1.";
            if (digits.Distinct().Count() == 1) return "Ingresa un número de teléfono válido.";

            var areaCode = digits[..3];
            if (areaCode is not ("809" or "829" or "849"))
                return "El código de área debe ser 809, 829 o 849.";
            if (digits[3] is < '2' or > '9')
                return "El número telefónico no tiene una estructura válida.";

            normalizedPhone = $"+1{digits}";
            return null;
        }

        private static string? GetPasswordValidationMessage(string password)
        {
            if (password.Length < 12) return "La contraseña debe tener al menos 12 caracteres.";
            if (!password.Any(char.IsUpper)) return "La contraseña debe incluir al menos una letra mayúscula.";
            if (!password.Any(char.IsLower)) return "La contraseña debe incluir al menos una letra minúscula.";
            if (!password.Any(char.IsDigit)) return "La contraseña debe incluir al menos un número.";
            if (!password.Any(character => !char.IsLetterOrDigit(character))) return "La contraseña debe incluir al menos un símbolo.";
            if (password.Distinct().Count() < 6) return "La contraseña debe usar al menos 6 caracteres distintos.";
            return null;
        }
    }
}
