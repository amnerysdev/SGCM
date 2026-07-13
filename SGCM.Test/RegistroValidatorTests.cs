using Xunit;
using SGCM.Data.Validation;

namespace SGCM.Test;

public class RegistroValidatorTests
{
    [Fact]
    public void PasswordsMatch_ReturnsTrue_WhenPasswordsAreEqual()
    {
        string password = "123456";
        string confirmPassword = "123456";

        bool result = RegistroValidator.PasswordsMatch(password, confirmPassword);

        Assert.True(result);
    }

    [Fact]
    public void PasswordsMatch_ReturnsFalse_WhenPasswordsAreDifferent()
    {
        string password = "123456";
        string confirmPassword = "654321";

        bool result = RegistroValidator.PasswordsMatch(password, confirmPassword);

        Assert.False(result);
    }
}