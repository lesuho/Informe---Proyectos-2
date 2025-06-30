describe('Authentication Flow', () => {
  it('should allow a user to log in and be redirected to the dashboard', () => {
    // Visitar la página de login
    cy.visit('/login');

    // Rellenar el formulario con credenciales desde cypress.env.json
    cy.get('input[type="email"]').type(Cypress.env('TEST_USER_EMAIL'));
    cy.get('input[type="password"]').type(Cypress.env('TEST_USER_PASSWORD'));

    // Enviar el formulario
    cy.get('button[type="submit"]').click();

    // Verificar la redirección y el contenido del dashboard
    // Asumimos que la URL del dashboard es '/' y que contiene un título "Tareas"
    cy.url().should('include', '/');
    cy.contains('h1', 'Tareas');
  });
}); 