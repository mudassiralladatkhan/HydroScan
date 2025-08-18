describe('Analytics Page E2E Tests', () => {
  beforeEach(() => {
    cy.seedDevices();
    cy.seedSensorData();
    cy.login();
    cy.visit('/analytics');
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  it('should display analytics dashboard with key metrics', () => {
    cy.contains('Analytics & Insights').should('be.visible');
    
    // Verify metric cards are displayed
    cy.contains('Avg pH Level').should('be.visible');
    cy.contains('Avg Temperature').should('be.visible');
    cy.contains('Avg TDS Level').should('be.visible');
    cy.contains('Contamination Risk').should('be.visible');
  });

  it('should render charts correctly', () => {
    cy.waitForChartToLoad();
    
    // Verify chart containers are present
    cy.get('[data-testid="responsive-container"]').should('have.length.at.least', 1);
    cy.get('[data-testid="line-chart"]').should('be.visible');
  });

  it('should allow time range filtering', () => {
    cy.contains('Last 24h').click();
    cy.contains('Select Time Range').should('be.visible');
    
    cy.contains('Last 7 Days').click();
    cy.contains('Apply Filter').click();
    
    // Verify filter is applied
    cy.contains('Last 7 Days').should('be.visible');
  });

  it('should export analytics data', () => {
    cy.contains('Export Report').click();
    cy.contains('Export Analytics Report').should('be.visible');
    
    // Configure export options
    cy.get('[data-testid="field-ph"]').should('be.checked');
    cy.get('[data-testid="field-temperature"]').should('be.checked');
    
    cy.contains('Generate & Download').click();
    
    // Verify success message
    cy.contains('Export Successful').should('be.visible');
  });

  it('should switch between analytics tabs', () => {
    cy.contains('Overview').should('have.class', 'data-[state=active]:text-white');
    
    cy.contains('Contamination').click();
    cy.contains('Contamination').should('have.class', 'data-[state=active]:text-white');
    
    cy.contains('Performance').click();
    cy.contains('Performance').should('have.class', 'data-[state=active]:text-white');
  });

  it('should handle empty data gracefully', () => {
    cy.cleanupTestData();
    cy.reload();
    
    cy.contains('No recent exports found').should('be.visible');
  });
});
