import { test, expect } from '@playwright/test';

/**
 * CASOS DE PRUEBA E2E - SISTEMA DE CITAS MÉDICAS
 * 
 * Técnicas de Selección de Datos de Prueba Aplicadas:
 * 
 * 1. PARTICIONES DE EQUIVALENCIA:
 *    - Emails válidos vs inválidos
 *    - Teléfonos con formato correcto vs incorrecto
 *    - Fechas futuras vs pasadas
 * 
 * 2. VALORES LÍMITE:
 *    - Nombres con longitud mínima (3 caracteres)
 *    - Teléfonos de exactamente 10 dígitos
 *    - Fechas en el límite (mañana, hoy)
 * 
 * 3. DATOS VÁLIDOS E INVÁLIDOS:
 *    - Campos vacíos (validación de campos requeridos)
 *    - Formatos incorrectos (email sin @, teléfono con letras)
 *    - Datos duplicados (email ya registrado)
 * 
 * 4. CASOS DE ESQUINA:
 *    - Múltiples citas para el mismo doctor
 *    - Citas con diferencia de menos de 1 hora
 *    - Cancelación de citas ya canceladas
 */

// Hook para reiniciar la base de datos antes de cada test
test.beforeEach(async ({ request }) => {
  await request.post('http://localhost:3000/api/reset');
});

test.describe('Sistema de Citas Médicas - Pruebas E2E', () => {
  
  /**
   * CASO DE PRUEBA 1: Flujo completo exitoso
   * Objetivo: Verificar el flujo completo desde registro hasta agendamiento
   * Técnica: Datos válidos en todas las particiones
   */
  test('CP001 - Flujo completo: Registro de paciente y agendamiento de cita exitoso', async ({ page }) => {
    await page.goto('/');
    
    // Paso 1: Registrar paciente con datos válidos
    await page.getByTestId('patient-name').fill('Juan Pérez García');
    await page.getByTestId('patient-email').fill('juan.perez@email.com');
    await page.getByTestId('patient-phone').fill('5551234567'); // 10 dígitos exactos
    await page.getByTestId('register-patient-btn').click();
    
    // Verificar mensaje de éxito
    await expect(page.locator('#mensaje-registro')).toContainText('Paciente registrado exitosamente');
    
    // Paso 2: Navegar a la pestaña de agendar cita
    await page.getByRole('button', { name: 'Agendar Cita' }).click();
    
    // Esperar a que se carguen los selects
    await page.waitForTimeout(500);
    
    // Paso 3: Agendar cita
    await page.getByTestId('appointment-patient-select').selectOption({ index: 1 });
    await page.getByTestId('appointment-doctor-select').selectOption({ index: 1 });
    
    // Fecha mañana (valor límite)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.getByTestId('appointment-date').fill(dateString);
    
    await page.getByTestId('appointment-time').fill('10:00');
    await page.getByTestId('appointment-reason').fill('Consulta general de rutina');
    await page.getByTestId('schedule-appointment-btn').click();
    
    // Verificar mensaje de éxito
    await expect(page.locator('#mensaje-cita')).toContainText('Cita agendada exitosamente');
    
    // Paso 4: Verificar que la cita aparece en "Mis Citas"
    await page.getByRole('button', { name: 'Mis Citas' }).click();
    await page.waitForTimeout(500);
    
    await expect(page.getByTestId('appointment-card-1')).toBeVisible();
    await expect(page.getByTestId('appointment-card-1')).toContainText('Juan Pérez García');
    await expect(page.getByTestId('appointment-card-1')).toContainText('Consulta general de rutina');
  });

  /**
   * CASO DE PRUEBA 2: Validación de email inválido
   * Objetivo: Verificar rechazo de emails con formato incorrecto
   * Técnica: Partición de equivalencia - datos inválidos
   */
  test('CP002 - Validación de email inválido en registro de paciente', async ({ page }) => {
    await page.goto('/');
    
    // Datos de prueba con diferentes emails inválidos
    const emailsInvalidos = [
      'correosinArroba.com',      // Sin @
      'correo@sindominio',        // Sin dominio
      '@sinusuario.com',          // Sin usuario
      'correo@.com'               // Dominio incompleto
    ];
    
    for (const emailInvalido of emailsInvalidos) {
      await page.getByTestId('patient-name').fill('María González');
      await page.getByTestId('patient-email').fill(emailInvalido);
      await page.getByTestId('patient-phone').fill('5559876543');
      await page.getByTestId('register-patient-btn').click();
      
      // Esperar un momento para que se procese
      await page.waitForTimeout(500);
      
      // Verificar mensaje de error
      await expect(page.locator('#mensaje-registro')).toContainText('Email inválido');
      
      // Limpiar campos para siguiente iteración
      await page.getByTestId('patient-email').clear();
    }
  });

  /**
   * CASO DE PRUEBA 3: Validación de campos vacíos
   * Objetivo: Verificar que todos los campos requeridos se validan
   * Técnica: Valores límite - mínimo (vacío)
   */
  test('CP003 - Validación de campos vacíos en registro de paciente', async ({ page }) => {
    await page.goto('/');
    
    // Intentar enviar formulario vacío
    await page.getByTestId('register-patient-btn').click();
    
    // HTML5 validation previene el envío
    const nameInput = page.getByTestId('patient-name');
    await expect(nameInput).toHaveAttribute('required');
    
    // Probar con solo un campo lleno
    await page.getByTestId('patient-name').fill('Pedro López');
    await page.getByTestId('register-patient-btn').click();
    
    const emailInput = page.getByTestId('patient-email');
    await expect(emailInput).toHaveAttribute('required');
    
    // Probar con dos campos llenos
    await page.getByTestId('patient-email').fill('pedro@mail.com');
    await page.getByTestId('register-patient-btn').click();
    
    const phoneInput = page.getByTestId('patient-phone');
    await expect(phoneInput).toHaveAttribute('required');
  });

  /**
   * CASO DE PRUEBA 4: Validación de teléfono inválido
   * Objetivo: Verificar validación de formato de teléfono
   * Técnica: Partición de equivalencia y valores límite
   */
  test('CP004 - Validación de teléfono inválido', async ({ page }) => {
    await page.goto('/');
    
    // Datos de prueba con teléfonos inválidos
    const telefonosInvalidos = [
      '123',              // Muy corto (límite inferior)
      '12345',            // 5 dígitos
      '123456789',        // 9 dígitos (uno menos del límite)
      '12345678901',      // 11 dígitos (uno más del límite)
      'abcd123456',       // Con letras
      '555-123-4567',     // Con guiones (11 caracteres)
    ];
    
    for (const telefonoInvalido of telefonosInvalidos) {
      await page.getByTestId('patient-name').fill('Carlos Ramírez');
      await page.getByTestId('patient-email').fill('carlos.ramirez@email.com');
      await page.getByTestId('patient-phone').fill(telefonoInvalido);
      await page.getByTestId('register-patient-btn').click();
      
      await expect(page.locator('#mensaje-registro')).toContainText('Teléfono inválido');
      
      await page.getByTestId('patient-phone').clear();
    }
  });

  /**
   * CASO DE PRUEBA 5: Nombre con longitud mínima
   * Objetivo: Verificar validación de longitud mínima del nombre
   * Técnica: Valores límite - mínimo (3 caracteres)
   */
  test('CP005 - Validación de nombre con longitud mínima', async ({ page }) => {
    await page.goto('/');
    
    // Caso 1: Nombre con menos de 3 caracteres (inválido)
    await page.getByTestId('patient-name').fill('Ab'); // 2 caracteres
    await page.getByTestId('patient-email').fill('test@email.com');
    await page.getByTestId('patient-phone').fill('5551234567');
    await page.getByTestId('register-patient-btn').click();
    
    await expect(page.locator('#mensaje-registro')).toContainText('al menos 3 caracteres');
    
    // Caso 2: Nombre con exactamente 3 caracteres (límite válido)
    await page.getByTestId('patient-name').clear();
    await page.getByTestId('patient-name').fill('Ana'); // 3 caracteres exactos
    await page.getByTestId('register-patient-btn').click();
    
    await expect(page.locator('#mensaje-registro')).toContainText('exitosamente');
  });

  /**
   * CASO DE PRUEBA 6: Intento de agendar cita en horario ocupado
   * Objetivo: Verificar que no se permiten citas solapadas
   * Técnica: Caso de esquina - conflicto de horarios
   */
  test('CP006 - Validación de horario ocupado para el mismo doctor', async ({ page }) => {
    await page.goto('/');
    
    // Registrar dos pacientes
    await page.getByTestId('patient-name').fill('Paciente Uno');
    await page.getByTestId('patient-email').fill('paciente1@email.com');
    await page.getByTestId('patient-phone').fill('5551111111');
    await page.getByTestId('register-patient-btn').click();
    await expect(page.locator('#mensaje-registro')).toContainText('exitosamente');
    
    await page.getByTestId('patient-name').fill('Paciente Dos');
    await page.getByTestId('patient-email').fill('paciente2@email.com');
    await page.getByTestId('patient-phone').fill('5552222222');
    await page.getByTestId('register-patient-btn').click();
    await expect(page.locator('#mensaje-registro')).toContainText('exitosamente');
    
    // Agendar primera cita
    await page.getByRole('button', { name: 'Agendar Cita' }).click();
    await page.waitForTimeout(500);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    await page.getByTestId('appointment-patient-select').selectOption({ index: 1 });
    await page.getByTestId('appointment-doctor-select').selectOption({ index: 1 }); // Dr. García
    await page.getByTestId('appointment-date').fill(dateString);
    await page.getByTestId('appointment-time').fill('14:00');
    await page.getByTestId('schedule-appointment-btn').click();
    
    await expect(page.locator('#mensaje-cita')).toContainText('exitosamente');
    
    // Intentar agendar segunda cita en el mismo horario
    await page.getByTestId('appointment-patient-select').selectOption({ index: 2 });
    await page.getByTestId('appointment-doctor-select').selectOption({ index: 1 }); // Mismo doctor
    await page.getByTestId('appointment-date').fill(dateString);
    await page.getByTestId('appointment-time').fill('14:00'); // Mismo horario
    await page.getByTestId('schedule-appointment-btn').click();
    
    // Verificar mensaje de error
    await expect(page.locator('#mensaje-cita')).toContainText('horario ya está ocupado');
  });

  /**
   * CASO DE PRUEBA 7: Citas con menos de 1 hora de diferencia
   * Objetivo: Verificar que se rechacen citas muy cercanas en tiempo
   * Técnica: Valores límite - margen temporal
   */
  test('CP007 - Validación de citas con menos de 1 hora de diferencia', async ({ page }) => {
    await page.goto('/');
    
    // Registrar paciente
    await page.getByTestId('patient-name').fill('Laura Fernández');
    await page.getByTestId('patient-email').fill('laura@email.com');
    await page.getByTestId('patient-phone').fill('5553333333');
    await page.getByTestId('register-patient-btn').click();
    
    await page.getByRole('button', { name: 'Agendar Cita' }).click();
    await page.waitForTimeout(500);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    // Primera cita a las 10:00
    await page.getByTestId('appointment-patient-select').selectOption({ index: 1 });
    await page.getByTestId('appointment-doctor-select').selectOption({ index: 2 }); // Dra. Martínez
    await page.getByTestId('appointment-date').fill(dateString);
    await page.getByTestId('appointment-time').fill('10:00');
    await page.getByTestId('schedule-appointment-btn').click();
    
    await expect(page.locator('#mensaje-cita')).toContainText('exitosamente');
    
    // Intentar segunda cita a las 10:30 (menos de 1 hora)
    await page.getByTestId('appointment-patient-select').selectOption({ index: 1 });
    await page.getByTestId('appointment-doctor-select').selectOption({ index: 2 });
    await page.getByTestId('appointment-date').fill(dateString);
    await page.getByTestId('appointment-time').fill('10:30');
    await page.getByTestId('schedule-appointment-btn').click();
    
    await expect(page.locator('#mensaje-cita')).toContainText('horario ya está ocupado');
    
    // Agendar cita a las 11:00 (exactamente 1 hora después) debería funcionar
    await page.getByTestId('appointment-time').fill('11:00');
    await page.getByTestId('schedule-appointment-btn').click();
    
    await expect(page.locator('#mensaje-cita')).toContainText('exitosamente');
  });

  /**
   * CASO DE PRUEBA 8: Cancelación de cita exitosa
   * Objetivo: Verificar el flujo de cancelación de citas
   * Técnica: Flujo nominal
   */
  test('CP008 - Cancelación de cita exitosa', async ({ page }) => {
    await page.goto('/');
    
    // Registrar paciente y agendar cita
    await page.getByTestId('patient-name').fill('Roberto Sánchez');
    await page.getByTestId('patient-email').fill('roberto@email.com');
    await page.getByTestId('patient-phone').fill('5554444444');
    await page.getByTestId('register-patient-btn').click();
    
    await page.getByRole('button', { name: 'Agendar Cita' }).click();
    await page.waitForTimeout(500);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    await page.getByTestId('appointment-patient-select').selectOption({ index: 1 });
    await page.getByTestId('appointment-doctor-select').selectOption({ index: 3 }); // Dr. López
    await page.getByTestId('appointment-date').fill(dateString);
    await page.getByTestId('appointment-time').fill('16:00');
    await page.getByTestId('schedule-appointment-btn').click();
    
    // Navegar a "Mis Citas"
    await page.getByRole('button', { name: 'Mis Citas' }).click();
    await page.waitForTimeout(500);
    
    // Verificar que la cita existe
    await expect(page.getByTestId('appointment-card-1')).toBeVisible();
    
    // Cancelar cita
    page.on('dialog', dialog => dialog.accept()); // Aceptar confirmación
    await page.getByTestId('cancel-appointment-1').click();
    
    await page.waitForTimeout(500);
    
    // Verificar que la cita aparece como cancelada
    await expect(page.getByTestId('appointment-card-1')).toContainText('Cancelada');
    
    // Verificar que el botón de cancelar ya no está visible
    await expect(page.getByTestId('cancel-appointment-1')).not.toBeVisible();
  });

  /**
   * CASO DE PRUEBA 9: Email duplicado
   * Objetivo: Verificar que no se permiten emails duplicados
   * Técnica: Datos duplicados - restricción de unicidad
   */
  test('CP009 - Validación de email duplicado', async ({ page }) => {
    await page.goto('/');
    
    const emailDuplicado = 'usuario@email.com';
    
    // Registrar primer paciente
    await page.getByTestId('patient-name').fill('Primer Usuario');
    await page.getByTestId('patient-email').fill(emailDuplicado);
    await page.getByTestId('patient-phone').fill('5555555555');
    await page.getByTestId('register-patient-btn').click();
    
    await expect(page.locator('#mensaje-registro')).toContainText('exitosamente');
    
    // Intentar registrar segundo paciente con el mismo email
    await page.getByTestId('patient-name').fill('Segundo Usuario');
    await page.getByTestId('patient-email').fill(emailDuplicado); // Email duplicado
    await page.getByTestId('patient-phone').fill('5556666666');
    await page.getByTestId('register-patient-btn').click();
    
    await expect(page.locator('#mensaje-registro')).toContainText('email ya está registrado');
  });

  /**
   * CASO DE PRUEBA 10: Múltiples citas para diferentes doctores en el mismo horario
   * Objetivo: Verificar que un paciente puede tener citas simultáneas con diferentes doctores
   * Técnica: Caso válido - diferentes doctores
   */
  test('CP010 - Múltiples citas simultáneas con diferentes doctores (válido)', async ({ page }) => {
    await page.goto('/');
    
    // Registrar paciente
    await page.getByTestId('patient-name').fill('Andrea Torres');
    await page.getByTestId('patient-email').fill('andrea@email.com');
    await page.getByTestId('patient-phone').fill('5557777777');
    await page.getByTestId('register-patient-btn').click();
    
    await page.getByRole('button', { name: 'Agendar Cita' }).click();
    await page.waitForTimeout(500);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    // Primera cita con Dr. García a las 15:00
    await page.getByTestId('appointment-patient-select').selectOption({ index: 1 });
    await page.getByTestId('appointment-doctor-select').selectOption({ index: 1 });
    await page.getByTestId('appointment-date').fill(dateString);
    await page.getByTestId('appointment-time').fill('15:00');
    await page.getByTestId('schedule-appointment-btn').click();
    
    await expect(page.locator('#mensaje-cita')).toContainText('exitosamente');
    
    // Segunda cita con Dra. Martínez a las 15:00 (mismo horario, diferente doctor)
    await page.getByTestId('appointment-patient-select').selectOption({ index: 1 });
    await page.getByTestId('appointment-doctor-select').selectOption({ index: 2 });
    await page.getByTestId('appointment-date').fill(dateString);
    await page.getByTestId('appointment-time').fill('15:00');
    await page.getByTestId('schedule-appointment-btn').click();
    
    // Esto debería ser exitoso porque son diferentes doctores
    await expect(page.locator('#mensaje-cita')).toContainText('exitosamente');
    
    // Verificar que ambas citas existen
    await page.getByRole('button', { name: 'Mis Citas' }).click();
    await page.waitForTimeout(500);
    
    await expect(page.getByTestId('appointment-card-1')).toBeVisible();
    await expect(page.getByTestId('appointment-card-2')).toBeVisible();
  });

  /**
   * CASO DE PRUEBA 11: Filtrado de citas por paciente
   * Objetivo: Verificar funcionalidad de filtrado
   * Técnica: Funcionalidad de búsqueda/filtrado
   */
  test('CP011 - Filtrado de citas por paciente', async ({ page }) => {
    await page.goto('/');
    
    // Registrar dos pacientes
    await page.getByTestId('patient-name').fill('Paciente A');
    await page.getByTestId('patient-email').fill('pacienteA@email.com');
    await page.getByTestId('patient-phone').fill('5558888888');
    await page.getByTestId('register-patient-btn').click();
    
    await page.getByTestId('patient-name').fill('Paciente B');
    await page.getByTestId('patient-email').fill('pacienteB@email.com');
    await page.getByTestId('patient-phone').fill('5559999999');
    await page.getByTestId('register-patient-btn').click();
    
    // Agendar citas para ambos pacientes
    await page.getByRole('button', { name: 'Agendar Cita' }).click();
    await page.waitForTimeout(1000);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    // Cita para Paciente A
    await page.getByTestId('appointment-patient-select').selectOption({ index: 1 });
    await page.getByTestId('appointment-doctor-select').selectOption({ index: 1 });
    await page.getByTestId('appointment-date').fill(dateString);
    await page.getByTestId('appointment-time').fill('09:00');
    await page.getByTestId('schedule-appointment-btn').click();
    
    // Esperar a que se procese y se recarguen los selects
    await page.waitForTimeout(1000);
    
    // Cita para Paciente B
    await page.getByTestId('appointment-patient-select').selectOption({ index: 2 });
    await page.getByTestId('appointment-doctor-select').selectOption({ index: 2 });
    await page.getByTestId('appointment-date').fill(dateString);
    await page.getByTestId('appointment-time').fill('10:00');
    await page.getByTestId('schedule-appointment-btn').click();
    
    // Ir a Mis Citas
    await page.getByRole('button', { name: 'Mis Citas' }).click();
    await page.waitForTimeout(500);
    
    // Verificar que ambas citas están visibles inicialmente
    await expect(page.getByTestId('appointment-card-1')).toBeVisible();
    await expect(page.getByTestId('appointment-card-2')).toBeVisible();
    
    // Filtrar por Paciente A
    await page.getByTestId('filter-patient-select').selectOption({ index: 1 });
    await page.waitForTimeout(500);
    
    // Solo debería verse la cita del Paciente A
    await expect(page.getByTestId('appointment-card-1')).toBeVisible();
  });

  /**
   * CASO DE PRUEBA 12: Validación de campos con espacios en blanco
   * Objetivo: Verificar que los espacios en blanco se manejan correctamente
   * Técnica: Datos de entrada con espacios (trimming)
   */
  test('CP012 - Validación de campos con espacios en blanco', async ({ page }) => {
    await page.goto('/');
    
    // Registrar con espacios al inicio y final
    await page.getByTestId('patient-name').fill('  Jorge Medina  ');
    await page.getByTestId('patient-email').fill('  jorge@email.com  ');
    await page.getByTestId('patient-phone').fill('  5550000000  ');
    await page.getByTestId('register-patient-btn').click();
    
    // Debería ser exitoso (trimming automático)
    await expect(page.locator('#mensaje-registro')).toContainText('exitosamente');
  });

});
