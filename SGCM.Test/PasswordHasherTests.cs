using SGCM.Data.Core;
using Xunit;

namespace SGCM.Test;

public class PasswordHasherTests
{
    [Fact]
    public void HashPassword_DebeGenerarUnHashDiferenteALaContrasena()
    {
        // Arrange
        string password = "ClaveSegura123";

        // Act
        string hash = PasswordHasher.HashPassword(password);

        // Assert
        Assert.False(string.IsNullOrWhiteSpace(hash));
        Assert.NotEqual(password, hash);
    }

    [Fact]
    public void VerifyPassword_DebeRetornarTrue_CuandoLaContrasenaEsCorrecta()
    {
        // Arrange
        string password = "ClaveSegura123";
        string hash = PasswordHasher.HashPassword(password);

        // Act
        bool resultado = PasswordHasher.VerifyPassword(password, hash);

        // Assert
        Assert.True(resultado);
    }

    [Fact]
    public void VerifyPassword_DebeRetornarFalse_CuandoLaContrasenaEsIncorrecta()
    {
        // Arrange
        string passwordCorrecta = "ClaveSegura123";
        string passwordIncorrecta = "ClaveIncorrecta456";
        string hash = PasswordHasher.HashPassword(passwordCorrecta);

        // Act
        bool resultado = PasswordHasher.VerifyPassword(
            passwordIncorrecta,
            hash
        );

        // Assert
        Assert.False(resultado);
    }

    [Fact]
    public void HashPassword_DebeGenerarHashesDiferentes_ParaLaMismaContrasena()
    {
        // Arrange
        string password = "ClaveSegura123";

        // Act
        string primerHash = PasswordHasher.HashPassword(password);
        string segundoHash = PasswordHasher.HashPassword(password);

        // Assert
        Assert.NotEqual(primerHash, segundoHash);
        Assert.True(PasswordHasher.VerifyPassword(password, primerHash));
        Assert.True(PasswordHasher.VerifyPassword(password, segundoHash));
    }
}