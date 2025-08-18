describe('Data Export E2E Tests', () => {
  beforeEach(() => {
    cy.seedDevices();
    cy.seedSensorData();
    cy.login();
    cy.visit('/data-export');
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  it('should display data export page with all options', () => {
    cy.contains('Data Export & Management').should('be.visible');
    
    // Verify export form elements
    cy.get('[data-testid="device-selector"]').should('be.visible');
    cy.get('[data-testid="date-from"]').should('be.visible');
    cy.get('[data-testid="date-to"]').should('be.visible');
    cy.get('[data-testid="export-format-selector"]').should('be.visible');
  });

  it('should export data in different formats', () => {
    // Set up export parameters
    cy.selectDevice('WS001');
    cy.setDateRange('2024-01-01', '2024-01-31');
    
    // Test CSV export
    cy.triggerExport('csv');
    cy.contains('Export initiated successfully').should('be.visible');
    
    // Test PDF export
    cy.triggerExport('pdf');
    cy.contains('Export initiated successfully').should('be.visible');
    
    // Test JSON export
    cy.triggerExport('json');
    cy.contains('Export initiated successfully').should('be.visible');
  });

  it('should validate export form inputs', () => {
    cy.get('[data-testid="export-button"]').click();
    
    // Should show validation errors
    cy.contains('Date Range Required').should('be.visible');
    
    // Fill partial form
    cy.setDateRange('2024-01-01', '2024-01-31');
    cy.get('[data-testid="export-button"]').click();
    
    // Should proceed with valid inputs
    cy.contains('Export initiated successfully').should('be.visible');
  });

  it('should display recent exports', () => {
    // First create an export
    cy.selectDevice('WS001');
    cy.setDateRange('2024-01-01', '2024-01-31');
    cy.triggerExport('csv');
    
    // Verify it appears in recent exports
    cy.contains('Recent Exports').should('be.visible');
    cy.contains('hydroscan_').should('be.visible');
  });

  it('should show performance metrics', () => {
    cy.contains('Data Performance Metrics').should('be.visible');
    
    // Verify metric cards
    cy.contains('Ingestion Rate').should('be.visible');
    cy.contains('Query Latency').should('be.visible');
    cy.contains('Storage Used').should('be.visible');
    cy.contains('API Response Time').should('be.visible');
  });
});
