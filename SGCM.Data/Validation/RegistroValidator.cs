namespace SGCM.Data.Validation
{
    public static class RegistroValidator
    {
        public static bool PasswordsMatch(string password, string confirmPassword)
        {
            return password == confirmPassword;
        }
    }
}