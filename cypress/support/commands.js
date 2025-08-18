// Custom commands for HydroScan testing

// Authentication commands
Cypress.Commands.add('login', (email = 'test@hydroscan.com', password = 'testpassword') => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('not.include', '/login');
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/login');
});

// Data seeding commands
Cypress.Commands.add('seedSensorData', () => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('SUPABASE_URL')}/rest/v1/sensor_readings`,
    headers: {
      'apikey': Cypress.env('SUPABASE_ANON_KEY'),
      'Content-Type': 'application/json'
    },
    body: [
      {
        device_id: 'WS001',
        ph: 7.2,
        turbidity: 1.5,
        tds: 150,
        temperature: 22.5,
        contamination_score: 15,
        timestamp: new Date().toISOString()
      }
    ]
  });
});

Cypress.Commands.add('seedDevices', () => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('SUPABASE_URL')}/rest/v1/devices`,
    headers: {
      'apikey': Cypress.env('SUPABASE_ANON_KEY'),
      'Content-Type': 'application/json'
    },
    body: [
      {
        id: 'WS001',
        name: 'Water Station 001',
        location: 'North District',
        status: 'online',
        battery_level: 85,
        signal_strength: 92
      }
    ]
  });
});

// UI interaction commands
Cypress.Commands.add('selectDevice', (deviceId) => {
  cy.get('[data-testid="device-selector"]').click();
  cy.get(`[data-value="${deviceId}"]`).click();
});

Cypress.Commands.add('setDateRange', (fromDate, toDate) => {
  cy.get('[data-testid="date-from"]').type(fromDate);
  cy.get('[data-testid="date-to"]').type(toDate);
});

Cypress.Commands.add('waitForChartToLoad', () => {
  cy.get('[data-testid="responsive-container"]').should('be.visible');
  cy.wait(1000); // Allow time for chart animation
});

// Export testing commands
Cypress.Commands.add('triggerExport', (format = 'csv') => {
  cy.get('[data-testid="export-format-selector"]').select(format);
  cy.get('[data-testid="export-button"]').click();
});

Cypress.Commands.add('verifyDownload', (filename) => {
  const downloadsFolder = Cypress.config('downloadsFolder');
  cy.readFile(`${downloadsFolder}/${filename}`).should('exist');
});

// API testing commands
Cypress.Commands.add('testApiEndpoint', (endpoint, expectedStatus = 200) => {
  cy.request({
    method: 'GET',
    url: `${Cypress.env('SUPABASE_URL')}/functions/v1/api-proxy/${endpoint}`,
    headers: {
      'apikey': Cypress.env('SUPABASE_ANON_KEY')
    },
    failOnStatusCode: false
  }).then((response) => {
    expect(response.status).to.eq(expectedStatus);
  });
});

// Cleanup commands
Cypress.Commands.add('cleanupTestData', () => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('SUPABASE_URL')}/rest/v1/sensor_readings?device_id=eq.WS001`,
    headers: {
      'apikey': Cypress.env('SUPABASE_ANON_KEY')
    },
    failOnStatusCode: false
  });
  
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('SUPABASE_URL')}/rest/v1/devices?id=eq.WS001`,
    headers: {
      'apikey': Cypress.env('SUPABASE_ANON_KEY')
    },
    failOnStatusCode: false
  });
});
