describe('HydroScan Complete Workflow', () => {
  beforeEach(() => {
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: {
          id: 'test-user-id',
          email: 'test@hydroscan.com',
          role: 'admin'
        }
      }));
    });
    
    // Intercept API calls
    cy.intercept('GET', '**/rest/v1/devices*', { fixture: 'devices.json' }).as('getDevices');
    cy.intercept('GET', '**/rest/v1/sensor_readings*', { fixture: 'sensorReadings.json' }).as('getSensorReadings');
    cy.intercept('GET', '**/rest/v1/alerts*', { fixture: 'alerts.json' }).as('getAlerts');
    cy.intercept('POST', '**/rest/v1/devices', { fixture: 'newDevice.json' }).as('createDevice');
  });

  it('completes full user workflow', () => {
    // 1. Login and Dashboard
    cy.visit('/');
    cy.contains('Welcome to T_P_P').should('be.visible');
    cy.contains('Real-time water quality monitoring overview').should('be.visible');
    
    // Check key metrics are displayed
    cy.contains('Active Devices').should('be.visible');
    cy.contains('Active Alerts').should('be.visible');
    cy.contains('Avg Water Quality').should('be.visible');
    
    // 2. Navigate to Device Management
    cy.get('[data-testid="nav-devices"]').click();
    cy.url().should('include', '/devices');
    cy.contains('Device Management').should('be.visible');
    
    // 3. Add New Device
    cy.contains('Add Device').click();
    cy.get('[data-testid="device-name-input"]').type('Test Water Station');
    cy.get('[data-testid="device-serial-input"]').type('WS001');
    cy.get('[data-testid="device-location-input"]').type('Test Location');
    cy.get('[data-testid="save-device-btn"]').click();
    
    cy.wait('@createDevice');
    cy.contains('Device added successfully').should('be.visible');
    
    // 4. View Real-time Sensors
    cy.get('[data-testid="nav-realtime"]').click();
    cy.url().should('include', '/realtime-sensors');
    cy.contains('Real-time Sensor Monitoring').should('be.visible');
    
    // Check sensor charts are rendered
    cy.get('[data-testid="sensor-chart"]').should('be.visible');
    cy.get('[data-testid="ph-chart"]').should('be.visible');
    cy.get('[data-testid="turbidity-chart"]').should('be.visible');
    
    // 5. Analytics Page
    cy.get('[data-testid="nav-analytics"]').click();
    cy.url().should('include', '/analytics');
    cy.contains('Water Quality Analytics').should('be.visible');
    
    // Check analytics components
    cy.get('[data-testid="trend-chart"]').should('be.visible');
    cy.get('[data-testid="comparison-chart"]').should('be.visible');
    
    // 6. Alert Rules Management
    cy.get('[data-testid="nav-alert-rules"]').click();
    cy.url().should('include', '/alert-rules');
    cy.contains('Alert Rules').should('be.visible');
    
    // Create new alert rule
    cy.contains('Add Rule').click();
    cy.get('[data-testid="rule-name-input"]').type('pH Range Alert');
    cy.get('[data-testid="parameter-select"]').select('ph');
    cy.get('[data-testid="condition-select"]').select('outside_range');
    cy.get('[data-testid="threshold-1-input"]').type('6.5');
    cy.get('[data-testid="threshold-2-input"]').type('8.5');
    cy.get('[data-testid="save-rule-btn"]').click();
    
    cy.contains('Alert rule created').should('be.visible');
    
    // 7. Settings Page
    cy.get('[data-testid="nav-settings"]').click();
    cy.url().should('include', '/settings');
    cy.contains('Settings').should('be.visible');
    
    // Test theme toggle
    cy.get('[data-testid="theme-toggle"]').click();
    cy.get('html').should('have.class', 'light');
    
    // 8. Data Export
    cy.get('[data-testid="nav-export"]').click();
    cy.url().should('include', '/export-data');
    cy.contains('Data Export').should('be.visible');
    
    // Test export functionality
    cy.get('[data-testid="export-format-select"]').select('csv');
    cy.get('[data-testid="date-range-picker"]').click();
    cy.get('[data-testid="export-btn"]').click();
    
    cy.contains('Export completed').should('be.visible');
  });

  it('handles error states gracefully', () => {
    // Test network error handling
    cy.intercept('GET', '**/rest/v1/devices*', { statusCode: 500 }).as('getDevicesError');
    
    cy.visit('/devices');
    cy.wait('@getDevicesError');
    cy.contains('Error loading devices').should('be.visible');
    
    // Test retry functionality
    cy.intercept('GET', '**/rest/v1/devices*', { fixture: 'devices.json' }).as('getDevicesRetry');
    cy.get('[data-testid="retry-btn"]').click();
    cy.wait('@getDevicesRetry');
    cy.contains('Device Management').should('be.visible');
  });

  it('validates form inputs', () => {
    cy.visit('/devices');
    cy.contains('Add Device').click();
    
    // Try to save without required fields
    cy.get('[data-testid="save-device-btn"]').click();
    cy.contains('Device name is required').should('be.visible');
    cy.contains('Serial number is required').should('be.visible');
    
    // Test invalid serial number format
    cy.get('[data-testid="device-name-input"]').type('Test Device');
    cy.get('[data-testid="device-serial-input"]').type('invalid format');
    cy.get('[data-testid="save-device-btn"]').click();
    cy.contains('Invalid serial number format').should('be.visible');
  });

  it('tests responsive design', () => {
    // Test mobile view
    cy.viewport(375, 667);
    cy.visit('/');
    
    // Check mobile navigation
    cy.get('[data-testid="mobile-menu-btn"]').should('be.visible');
    cy.get('[data-testid="mobile-menu-btn"]').click();
    cy.get('[data-testid="mobile-nav"]').should('be.visible');
    
    // Test tablet view
    cy.viewport(768, 1024);
    cy.get('[data-testid="mobile-nav"]').should('not.be.visible');
    cy.get('[data-testid="desktop-nav"]').should('be.visible');
    
    // Test desktop view
    cy.viewport(1920, 1080);
    cy.get('[data-testid="desktop-nav"]').should('be.visible');
    cy.get('[data-testid="sidebar"]').should('be.visible');
  });
});
