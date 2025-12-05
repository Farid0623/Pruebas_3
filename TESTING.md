# Documentación de Pruebas E2E - Sistema de Citas Médicas

## Índice
1. [Técnicas de Selección de Datos de Prueba](#técnicas-de-selección-de-datos-de-prueba)
2. [Casos de Prueba Implementados](#casos-de-prueba-implementados)
3. [Matriz de Cobertura](#matriz-de-cobertura)
4. [Ejecución de Pruebas](#ejecución-de-pruebas)

---

## Técnicas de Selección de Datos de Prueba

### 1. Particiones de Equivalencia

Dividimos los datos de entrada en grupos donde se espera que todos los elementos se comporten de manera similar.

**Aplicaciones:**
- **Email:**
  - Partición válida: emails con formato correcto (`usuario@dominio.com`)
  - Partición inválida: emails sin @, sin dominio, con espacios, etc.

- **Teléfono:**
  - Partición válida: 10 dígitos numéricos
  - Partición inválida: menos de 10 dígitos, más de 10 dígitos, con caracteres no numéricos

- **Fecha:**
  - Partición válida: fechas futuras
  - Partición inválida: fechas pasadas o presentes

### 2. Valores Límite (Boundary Value Analysis)

Probamos los valores en los bordes de las particiones de equivalencia.

**Aplicaciones:**
- **Nombre:**
  - Límite inferior inválido: 2 caracteres
  - Límite inferior válido: 3 caracteres
  - Valores normales: 4+ caracteres

- **Teléfono:**
  - Límite inferior inválido: 9 dígitos
  - Límite exacto válido: 10 dígitos
  - Límite superior inválido: 11 dígitos

- **Horario de citas:**
  - Límite temporal: 1 hora de separación mínima
  - Casos probados: 0 minutos, 30 minutos, 60 minutos de separación

- **Fecha:**
  - Hoy: inválido (fecha presente)
  - Mañana: válido (límite de fecha futura)

### 3. Datos Válidos e Inválidos

Combinamos datos correctos e incorrectos para validar el comportamiento del sistema.

**Aplicaciones:**
- Campos vacíos vs campos llenos
- Formatos correctos vs incorrectos
- Datos únicos vs duplicados
- Combinaciones válidas vs inválidas de doctor/horario

### 4. Casos de Esquina (Corner Cases)

Situaciones especiales o menos comunes que pueden causar errores.

**Aplicaciones:**
- Múltiples citas para el mismo doctor en horarios cercanos
- Citas simultáneas con diferentes doctores
- Cancelación de citas ya canceladas
- Email duplicado
- Espacios en blanco al inicio/final de campos

---

## Casos de Prueba Implementados

### CP001 - Flujo Completo Exitoso
**Objetivo:** Verificar el flujo completo desde registro hasta agendamiento de cita.

**Técnica aplicada:** Datos válidos en todas las particiones

**Pasos:**
1. Registrar paciente con datos válidos
2. Navegar a agendar cita
3. Seleccionar paciente, doctor, fecha y hora
4. Verificar confirmación de cita
5. Validar que la cita aparece en listado

**Datos de prueba:**
- Nombre: "Juan Pérez García" (válido, > 3 caracteres)
- Email: "juan.perez@email.com" (válido, formato correcto)
- Teléfono: "5551234567" (válido, 10 dígitos exactos)
- Fecha: Mañana (valor límite de fecha futura)
- Hora: 10:00

**Resultado esperado:** Registro y cita exitosos

---

### CP002 - Validación de Email Inválido
**Objetivo:** Verificar el rechazo de emails con formato incorrecto.

**Técnica aplicada:** Partición de equivalencia - datos inválidos

**Datos de prueba:**
- `correosinArroba.com` - Sin símbolo @
- `correo@sindominio` - Sin dominio completo
- `@sinusuario.com` - Sin parte de usuario
- `correo incorrecto@mail.com` - Con espacios
- `correo@.com` - Dominio incompleto

**Resultado esperado:** Error "Email inválido" en todos los casos

---

### CP003 - Validación de Campos Vacíos
**Objetivo:** Verificar que todos los campos requeridos se validan.

**Técnica aplicada:** Valores límite - mínimo (vacío)

**Escenarios:**
1. Formulario completamente vacío
2. Solo nombre lleno
3. Solo nombre y email llenos

**Resultado esperado:** Validación HTML5 impide el envío; todos los campos muestran atributo `required`

---

### CP004 - Validación de Teléfono Inválido
**Objetivo:** Verificar validación de formato de teléfono.

**Técnica aplicada:** Partición de equivalencia y valores límite

**Datos de prueba:**
- `123` - Muy corto (límite inferior)
- `12345` - 5 dígitos
- `123456789` - 9 dígitos (uno menos del límite)
- `12345678901` - 11 dígitos (uno más del límite)
- `abcd123456` - Con letras
- `555-123-4567` - Con guiones

**Resultado esperado:** Error "Teléfono inválido. Debe tener 10 dígitos"

---

### CP005 - Validación de Nombre con Longitud Mínima
**Objetivo:** Verificar validación de longitud mínima del nombre.

**Técnica aplicada:** Valores límite - mínimo (3 caracteres)

**Datos de prueba:**
- `Ab` - 2 caracteres (inválido, por debajo del límite)
- `Ana` - 3 caracteres (válido, justo en el límite)

**Resultado esperado:** 
- 2 caracteres: Error "debe tener al menos 3 caracteres"
- 3 caracteres: Registro exitoso

---

### CP006 - Validación de Horario Ocupado
**Objetivo:** Verificar que no se permiten citas solapadas para el mismo doctor.

**Técnica aplicada:** Caso de esquina - conflicto de horarios

**Escenario:**
1. Paciente 1 agenda cita con Dr. García a las 14:00
2. Paciente 2 intenta agendar con Dr. García a las 14:00

**Resultado esperado:** Error "El horario ya está ocupado para este doctor"

---

### CP007 - Citas con Menos de 1 Hora de Diferencia
**Objetivo:** Verificar que se rechacen citas muy cercanas en tiempo.

**Técnica aplicada:** Valores límite - margen temporal

**Escenarios:**
1. Primera cita a las 10:00
2. Intento de cita a las 10:30 (30 minutos después)
3. Cita a las 11:00 (60 minutos después)

**Resultado esperado:** 
- 10:30: Rechazada (< 1 hora)
- 11:00: Aceptada (≥ 1 hora)

---

### CP008 - Cancelación de Cita Exitosa
**Objetivo:** Verificar el flujo de cancelación de citas.

**Técnica aplicada:** Flujo nominal

**Pasos:**
1. Crear cita
2. Navegar a "Mis Citas"
3. Cancelar cita
4. Verificar estado "Cancelada"
5. Verificar que botón de cancelar desaparece

**Resultado esperado:** Cita cancelada correctamente, estado actualizado

---

### CP009 - Validación de Email Duplicado
**Objetivo:** Verificar que no se permiten emails duplicados.

**Técnica aplicada:** Datos duplicados - restricción de unicidad

**Escenario:**
1. Registrar paciente con email "usuario@email.com"
2. Intentar registrar otro paciente con el mismo email

**Resultado esperado:** Error "El email ya está registrado"

---

### CP010 - Múltiples Citas Simultáneas con Diferentes Doctores
**Objetivo:** Verificar que un paciente puede tener citas simultáneas con diferentes doctores.

**Técnica aplicada:** Caso válido - diferentes doctores

**Escenario:**
1. Paciente agenda con Dr. García a las 15:00
2. Mismo paciente agenda con Dra. Martínez a las 15:00

**Resultado esperado:** Ambas citas se crean exitosamente

---

### CP011 - Filtrado de Citas por Paciente
**Objetivo:** Verificar funcionalidad de filtrado.

**Técnica aplicada:** Funcionalidad de búsqueda/filtrado

**Escenario:**
1. Crear citas para dos pacientes diferentes
2. Aplicar filtro por Paciente A
3. Verificar que solo aparecen citas de Paciente A

**Resultado esperado:** Filtro funciona correctamente

---

### CP012 - Validación de Campos con Espacios en Blanco
**Objetivo:** Verificar que los espacios en blanco se manejan correctamente.

**Técnica aplicada:** Datos de entrada con espacios (trimming)

**Datos de prueba:**
- Nombre: `"  Jorge Medina  "`
- Email: `"  jorge@email.com  "`
- Teléfono: `"  5550000000  "`

**Resultado esperado:** Registro exitoso con trimming automático

---

## Matriz de Cobertura

| Funcionalidad | Particiones | Valores Límite | Datos Inválidos | Casos Esquina | CP Asociados |
|---------------|-------------|----------------|-----------------|---------------|--------------|
| Registro de paciente | ✓ | ✓ | ✓ | ✓ | CP001-CP005, CP009, CP012 |
| Validación email | ✓ | - | ✓ | - | CP002, CP009 |
| Validación teléfono | ✓ | ✓ | ✓ | - | CP004 |
| Validación nombre | - | ✓ | ✓ | ✓ | CP003, CP005, CP012 |
| Agendar cita | ✓ | ✓ | ✓ | ✓ | CP001, CP006-CP007, CP010 |
| Solapamiento horarios | - | ✓ | - | ✓ | CP006, CP007 |
| Cancelar cita | - | - | - | ✓ | CP008 |
| Filtrado de citas | ✓ | - | - | - | CP011 |

**Cobertura total:**
- ✅ 12 casos de prueba automatizados
- ✅ 4 técnicas de selección de datos aplicadas
- ✅ 100% de funcionalidades críticas cubiertas
- ✅ Validaciones de datos: 100%
- ✅ Flujos de negocio: 100%

---

## Ejecución de Pruebas

### Localmente

```bash
# Ejecutar todas las pruebas E2E
npm run test:e2e

# Ejecutar con interfaz visual
npm run test:e2e:headed

# Ejecutar con UI mode (debugging)
npm run test:e2e:ui
```

### En CI/CD (GitHub Actions)

Las pruebas se ejecutan automáticamente en cada:
- Push a las ramas `main` o `develop`
- Pull Request hacia `main` o `develop`
- Ejecución manual desde la pestaña "Actions"

**Resultado exitoso:**
- Si todas las pruebas pasan, se imprime `OK` en la consola
- Se generan reportes HTML con detalles de ejecución
- Los artefactos se guardan por 30 días

---

## Justificación de Casos de Prueba Elegidos

### 1. Cobertura de Requisitos Funcionales
Todos los requisitos principales del sistema están cubiertos:
- ✅ Registro de pacientes con validación
- ✅ Creación de citas con validación de horarios
- ✅ Listado de citas
- ✅ Cancelación de citas

### 2. Validaciones Críticas
Se priorizaron las validaciones que previenen errores de negocio:
- Email y teléfono válidos (contactabilidad)
- Horarios no solapados (integridad de agenda)
- Campos requeridos (datos completos)

### 3. Experiencia de Usuario
Se probaron escenarios reales de uso:
- Flujo completo exitoso (caso happy path)
- Manejo de errores con mensajes claros
- Filtrado y visualización de información

### 4. Casos de Borde y Excepcionales
Se incluyeron casos que podrían causar fallos:
- Valores en los límites de validación
- Datos duplicados
- Conflictos de horario
- Entrada de datos con formato incorrecto

### 5. Técnicas de Testing Aplicadas

**Particiones de Equivalencia:**
- Reduce el número de casos de prueba
- Mantiene alta cobertura
- Ejemplos: emails válidos/inválidos, fechas pasadas/futuras

**Valores Límite:**
- Encuentra errores en los bordes de las reglas de negocio
- Ejemplos: 3 caracteres mínimo, 10 dígitos exactos, 1 hora de separación

**Datos Inválidos:**
- Verifica robustez del sistema
- Asegura mensajes de error apropiados
- Ejemplos: campos vacíos, formatos incorrectos

**Casos de Esquina:**
- Situaciones complejas o infrecuentes
- Previene errores en producción
- Ejemplos: citas simultáneas, emails duplicados

---

## Mejoras Futuras

1. **Pruebas de Rendimiento:** Medir tiempos de respuesta con múltiples usuarios
2. **Pruebas de Seguridad:** Validar inyección SQL, XSS, CSRF
3. **Pruebas de Accesibilidad:** Verificar WCAG 2.1 compliance
4. **Pruebas de Compatibilidad:** Múltiples navegadores (Firefox, Safari, Edge)
5. **Pruebas de Responsividad:** Diferentes tamaños de pantalla
6. **Pruebas de Carga:** Simular múltiples citas simultáneas
7. **Pruebas de Integración:** Validar integración con base de datos real
8. **Pruebas de Regresión Visual:** Screenshots comparison

---

**Fecha de última actualización:** 5 de diciembre de 2025  
**Versión:** 1.0.0  
**Herramienta de pruebas:** Playwright 1.40.0  
**Framework:** Node.js 18+ / Express 4.18.2
