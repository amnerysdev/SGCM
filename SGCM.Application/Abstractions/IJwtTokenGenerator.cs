using SGCM.Domain.Entities;

namespace SGCM.Application.Abstractions
{
    public interface IJwtTokenGenerator
    {
        (string Token, DateTime Expiration) GenerateToken(AppUser user, IEnumerable<string> roles);
    }
}
