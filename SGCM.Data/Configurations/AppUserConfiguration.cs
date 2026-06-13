using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCM.Data.Entities;

namespace SGCM.Data.Configurations
{
    public class AppUserConfiguration : IEntityTypeConfiguration<AppUser>
    {
        public void Configure(EntityTypeBuilder<AppUser> builder)
        {
            builder.Property(u => u.FullName)
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(u => u.IsActive)
                .HasDefaultValue(true);

            builder.Property(u => u.RegistrationDate)
                .HasDefaultValueSql("GETUTCDATE()");
        }
    }
}
