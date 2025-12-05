# Sistema de Reserva de Citas Médicas

Sistema completo con API REST, frontend y pruebas E2E automatizadas.

## Características

- **API REST** (Node.js/Express):
  - Registro de pacientes con validación de email y teléfono
  - Creación de citas médicas con validación de horarios
  - Listado de citas disponibles
  - Cancelación de citas

- **Frontend** (HTML/CSS/JS):
  - Formulario de registro de pacientes
  - Formulario de agendamiento de citas
  - Vista de citas agendadas con opción de cancelar

- **Pruebas E2E** (Playwright):
  - Flujo completo de registro y agendamiento
  - Validación de datos incorrectos
  - Validación de horarios ocupados
  - Cancelación de citas

## Instalación

```bash
npm install
```

## Uso

### Iniciar el servidor
```bash
npm start
```

### Modo desarrollo
```bash
npm run dev
```

### Ejecutar pruebas E2E
```bash
npm run test:e2e
```

### Ejecutar pruebas en modo visual
```bash
npm run test:e2e:headed
```

### Docker (Opcional)

#### Construir y ejecutar con Docker
```bash
docker build -t sistema-citas-medicas .
docker run -p 3000:3000 sistema-citas-medicas
```

#### Usar Docker Compose
```bash
# Iniciar aplicación
docker-compose up

# Ejecutar pruebas E2E en contenedor
docker-compose --profile test run test
```

## Estructura del Proyecto

```
├── server.js           # API REST
├── public/             # Frontend
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── tests/              # Pruebas E2E
│   └── appointments.spec.js
└── TESTING.md          # Documentación de pruebas
```

## API Endpoints

- `POST /api/patients` - Registrar paciente
- `GET /api/patients` - Listar pacientes
- `POST /api/appointments` - Crear cita
- `GET /api/appointments` - Listar citas
- `DELETE /api/appointments/:id` - Cancelar cita
- `GET /api/doctors` - Listar doctores disponibles

## GitHub Actions

El workflow de CI/CD ejecuta automáticamente las pruebas E2E en cada push/PR.

## Documentación Adicional

- 📖 **[TESTING.md](TESTING.md)** - Documentación detallada de pruebas y técnicas aplicadas
- 📊 **[RESUMEN.md](RESUMEN.md)** - Resumen ejecutivo del proyecto
- ⚡ **[QUICKSTART.md](QUICKSTART.md)** - Guía de inicio rápido
- 📈 **[STATS.md](STATS.md)** - Estadísticas del proyecto

## Tecnologías

- **Backend**: Node.js 18+, Express 4.18.2
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Testing**: Playwright 1.40.0
- **CI/CD**: GitHub Actions
- **Containerización**: Docker (opcional)
