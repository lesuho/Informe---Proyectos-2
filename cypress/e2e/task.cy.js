describe('Task Management', () => {
  beforeEach(() => {
    // Iniciar sesión una vez antes de todas las pruebas en este bloque
    cy.login();
    // Visitamos la página después de que la sesión se haya restaurado o creado
    cy.visit('/');
  });

  it('should allow a user to create a new task', () => {
    // Usamos un título único para evitar conflictos entre pruebas
    const taskTitle = `Mi nueva tarea de prueba - ${Date.now()}`;
    const taskDescription = 'Esta es una descripción para la nueva tarea.';

    // 1. Hacer clic en el botón para ir al formulario de creación
    // Usamos cy.contains para encontrar el botón por su texto.
    cy.contains('Crear Nueva Tarea').click();

    // 2. Rellenar el formulario
    cy.get('input[name="title"]').type(taskTitle);
    cy.get('textarea[name="description"]').type(taskDescription);

    // 3. Enviar el formulario
    cy.get('form').submit();

    // 4. Verificar que fuimos redirigidos al dashboard
    cy.url().should('include', '/tasks');

    // 5. Verificar que la nueva tarea aparece en la página
    // Usamos 'exist' en lugar de 'be.visible' por si la tarea se crea fuera de la vista (en un contenedor con scroll).
    cy.contains(taskTitle).should('exist');
  });
}); 