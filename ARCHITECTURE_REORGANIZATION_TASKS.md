# SGCM: tareas pendientes de reorganizacion

Este archivo sirve como handoff para el siguiente agente. El objetivo es continuar la reorganizacion arquitectonica sin romper la funcionalidad ni cambiar el diseño visual.

## Estado actual

La aplicacion es un monolito .NET 9 con un frontend vanilla multipagina construido con Vite.

- Backend: `SGCM`, `SGCM.Application`, `SGCM.Data`, `SGCM.Domain`.
- Frontend: `SGCM.Web`.
- Tests: `SGCM.Test`.
- Frontend dev server: `http://localhost:5173`.
- Backend local: `http://localhost:5236`.
- El backend usa base de datos InMemory en Development.
- Las credenciales demo estan documentadas en `SGCM.Data/TestData/TEST_CREDENTIALS.md`.

## Trabajo ya completado

### Backend y seguridad

- Se agregaron comprobaciones de ownership en:
  - `SGCM/Controllers/AppointmentController.cs`
  - `SGCM/Controllers/AvailabilityController.cs`
  - `SGCM/Controllers/DoctorController.cs`
  - `SGCM/Controllers/MedicalRecordController.cs`
  - `SGCM/Controllers/PatientController.cs`
- Pacientes y doctores quedan limitados a sus propios recursos, salvo administradores.
- Se protegieron consultas y mutaciones de citas, disponibilidad, perfiles y expedientes.
- Se separo el seed de desarrollo en `SGCM.Data/Seeding/DevelopmentDataSeeder.cs`.
- `SGCM.Data/MigrationExtensions.cs` quedo como fachada de inicializacion/migracion y delegacion del seed.

### Frontend

- Se centralizo el transporte HTTP en `SGCM.Web/src/api/http-client.js`.
- Se migraron al cliente compartido los modulos de:
  - perfiles;
  - especialidades;
  - expedientes;
  - agenda del doctor;
  - disponibilidad;
  - agendamiento de citas.
- Se separo la API de cuenta en `SGCM.Web/src/api/account-api.js`.
- Se separo el almacenamiento de sesion en `SGCM.Web/src/shared/session.js`.
- `SGCM.Web/src/api.js` se conserva como fachada de compatibilidad.
- Se creo `SGCM.Web/src/components/profile-view.js` para helpers compartidos de perfiles.
- Se eliminaron residuos de la plantilla Vite:
  - `SGCM.Web/src/main.js`
  - `SGCM.Web/src/dashboard.js`
- `dashboard.html` carga directamente `app-shell.js`.
- Se modularizaron parcialmente los estilos en `SGCM.Web/src/styles/`.

### Verificacion actual

- `npm run build` desde `SGCM.Web`: correcto.
- `dotnet build SGCM.sln`: correcto.
- `dotnet test SGCM.sln`: 139 pruebas correctas.
- `git diff --check`: correcto.
- Diagnosticos de los archivos modificados: sin errores.

## Tareas pendientes prioritarias

### 1. Dividir `citas.js`

Archivo actual: `SGCM.Web/src/citas.js`.

Actualmente mezcla:

- estado del wizard;
- carga de paciente, doctores y especialidades;
- reglas de fechas y dias;
- calculo de slots disponibles;
- deteccion de citas ocupadas;
- listeners de formulario;
- validacion;
- render de slots;
- envio de la cita;
- render de la confirmacion;
- SVGs de confirmacion.

Crear una estructura pequena y concreta:

```text
SGCM.Web/src/features/appointments/
  booking-page.js       # coordinador de eventos y flujo
  booking-state.js      # paciente, doctores y slot seleccionado
  booking-rules.js      # fechas, dias, slots y ocupacion
  booking-view.js       # errores, pasos, slots y confirmacion
```

Reglas importantes:

- Mantener el entrypoint actual o actualizar solo `agendar-cita.html`.
- Mantener IDs y clases existentes.
- No cambiar el comportamiento ni el diseño.
- Reutilizar `api/appointments-api.js`, `api/availability-api.js` y `http-client.js`.
- Extraer primero funciones puras (`getDay`, `toDateTime`, calculo de slots, `escapeHtml`) y validar build.
- Extraer despues render y finalmente listeners/coordinacion.
- No hacer una reescritura completa en un solo parche.

Criterios de aceptacion:

- El usuario puede seleccionar especialidad, profesional, fecha y hora.
- Los slots ocupados no aparecen.
- La cita se crea correctamente.
- La confirmacion visual sigue igual.
- El flujo sigue usando `/api/patients/me`, `/api/doctors`, `/api/specialties`, `/api/availability` y `/api/appointments`.

### 2. Completar API de perfiles y catalogos

Ya existe `api/profile-api.js`, pero `doctores.js` y `pacientes.js` aun mantienen parte de sus clientes locales.

Pendiente:

- mover completamente `doctorApi` y `patientApi` a clientes de API dedicados;
- crear, si aporta valor real, `api/catalog-api.js` para doctores/especialidades;
- cambiar las paginas de perfil para consumir esos clientes;
- eliminar funciones API duplicadas de `doctores.js` y `pacientes.js`.

No crear una abstraccion generica de CRUD si solo oculta diferencias entre endpoints.

### 3. Separar `app-shell.js`

Archivo actual: `SGCM.Web/src/app-shell.js`.

Separar, sin cambiar la API publica `mountAppShell()`:

```text
SGCM.Web/src/app/
  app-shell.js       # facade y bootstrap
  navigation.js      # LINK_GROUPS, ICONS y roleLabel
  shell-view.js      # creacion del markup
  shell-events.js    # menu, backdrop y logout
```

Criterios:

- `app-shell.js` debe seguir pudiendo importarse desde las paginas protegidas.
- El menu responsive debe seguir funcionando.
- El logout debe limpiar sesion y redirigir a `index.html`.
- No mover markup a un framework.

### 4. Separar `citas-doctor.js`

El archivo ya usa `api/appointments-api.js`, pero aun mezcla:

- carga de datos;
- render de filas;
- handlers de estado;
- formulario de reprogramacion;
- feedback.

Estructura sugerida:

```text
SGCM.Web/src/features/appointments/
  doctor-appointments-page.js
  doctor-appointments-view.js
  appointment-actions.js
```

Mantenerlo simple: extraer primero el renderer y luego las acciones.

### 5. Separar especialidades y expedientes

Archivos:

- `SGCM.Web/src/especialidades.js`
- `SGCM.Web/src/expedientes.js`

Pendiente:

- extraer render de tabla de especialidades;
- extraer estado de edicion del formulario;
- extraer render de tarjetas de expedientes;
- extraer coordinadores de pagina pequenos;
- mantener `window.sgcmDoctors`, `window.sgcmPatients`, `window.sgcmMedicalRecords` solo si algun HTML o integracion lo necesita.

### 6. Mejorar la organizacion HTML

No mover todos los HTML a una carpeta nueva: Vite los usa como entradas multipagina en la raiz.

Pendiente:

- formatear gradualmente HTML comprimidos:
  - `index.html`;
  - `register.html`;
  - `agendar-cita.html`;
  - `mis-citas.html`.
- conservar exactamente IDs, clases, scripts y rutas;
- revisar semantica de `header`, `main`, `section`, `article` y `footer`;
- eliminar scripts de pagina que ya no sean necesarios;
- confirmar que no queden estilos inline.

No crear templates HTML artificiales en esta fase.

### 7. Completar modularizacion CSS

La estructura ya iniciada esta en `SGCM.Web/src/styles/`.

Pendiente:

- extraer dashboard y app shell desde `src/style.css`;
- extraer booking y appointment confirmation;
- evitar cambiar valores visuales;
- conservar el orden de cascada;
- mantener `src/style.css` como facade de imports;
- revisar duplicacion entre `doctor-profile.css` y `patient-profile.css` despues de validar visualmente.

### 8. Corregir direccion de dependencias backend

Problema pendiente:

- `SGCM.Application` referencia `SGCM.Data`.
- Los servicios de Application importan `SGCM.Data.Interfaces`, `SGCM.Data.Validation` y tipos de infraestructura.

Plan:

1. Crear `SGCM.Application/Abstractions/`.
2. Mover alli las interfaces que Application necesita.
3. Actualizar implementaciones en Data para usar esas interfaces.
4. Mover contratos/validadores que pertenezcan a Application.
5. Eliminar la referencia `Application -> Data` solo cuando todas las referencias esten migradas.
6. Ejecutar build y tests despues de cada grupo.

No mover carpetas masivamente ni borrar archivos sin busqueda global de referencias.

### 9. Mejorar startup y configuracion

Pendiente:

- sustituir `Console.WriteLine` por `ILogger` en seed/migraciones;
- limitar `EnableSensitiveDataLogging()` a Development;
- decidir si los fallos de migracion deben detener el arranque fuera de Development;
- extraer configuracion de `Program.cs` solo si reduce complejidad real;
- no crear una capa `Infrastructure` vacia solo por convencion.

### 10. Añadir pruebas

Faltan pruebas para:

- ownership de controllers por rol;
- endpoints HTTP con `WebApplicationFactory`;
- seed idempotente;
- login real y contrato HTTP;
- doble reserva concurrente;
- comportamiento de la confirmacion de cita.

Cualquier refactor de `citas.js` debe acompañarse de pruebas de reglas puras de slots cuando esas reglas se extraigan.

## Convenciones para el siguiente agente

- Trabajar en una unidad pequena y ejecutable.
- Antes de editar, leer el archivo actual y formular una hipotesis local.
- Despues de cada primer edit, ejecutar el build o test mas cercano.
- Usar `apply_patch` para editar archivos existentes.
- Usar `create_file` solo para archivos nuevos.
- No revertir cambios existentes.
- No cambiar diseño visual ni contratos HTML sin necesidad.
- No introducir React, Redux, Sass, CQRS, MediatR ni microservicios.
- No crear capas vacias o abstracciones genericas sin consumidores reales.
- Mantener nombres de IDs/clases y rutas API durante la migracion.

## Comandos de validacion

```powershell
cd SGCM.Web
npm run build

cd ..
dotnet build SGCM.sln
dotnet test SGCM.sln
git diff --check
```

Para ejecutar localmente:

```powershell
$env:JWTSettings__Key='ThisIsATestKeyForLocalDevelopment_1234567890'
$env:ASPNETCORE_ENVIRONMENT='Development'
dotnet run --project SGCM/SGCM.Web.csproj --launch-profile http
```

URLs esperadas:

- Vite: `http://localhost:5173`
- ASP.NET: `http://localhost:5236`
