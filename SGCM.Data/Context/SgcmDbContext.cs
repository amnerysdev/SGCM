using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using SGCM.Data.Entities;

namespace SGCM.Data.Context
{
    public class SgcmDbContext : IdentityDbContext<AppUser>
    {
        public SgcmDbContext(DbContextOptions<SgcmDbContext> options) : base(options)
        {
        }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<MedicalRecord> MedicalRecords { get; set; }
        public DbSet<Specialty> Specialties { get; set; }

    }
}
