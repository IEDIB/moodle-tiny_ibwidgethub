import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("I am logged in as an admin", () => {
  cy.visit("/login/index.php");
  cy.get("#username").type("admin");
  cy.get("#password").type("12345");
  cy.get("#loginbtn").click();
});

When("I open the profile with the TinyMCE editor", () => {
  cy.visit("/user/editadvanced.php?id=2&course=1");
  cy.get("iframe.tox-edit-area__iframe", {timeout: 10000}).should("exist");
});

When('I click the toolbar button {string}', (/** @type {string}*/ buttonName) => {
  // TinyMCE toolbar buttons are outside the iframe
  // The second query is for split button (main icon)
  cy.get(`button[data-mce-name="${buttonName}"],div[data-mce-name="${buttonName}"][role="button"] span.tox-tbtn:first-child`).click();
});

When('I click the toolbar split button {string}', (/** @type {string}*/ buttonName) => {
  // TinyMCE toolbar buttons are outside the iframe
  // The second query is for split button (main icon)
  cy.get(`div[data-mce-name="${buttonName}"][role="button"] span.tox-tbtn:last-child`).click();
});

When('I click on the snippet {string} main button', (key) => {
  cy.get(`div[data-key="${key}"] button:first-child`).click();
});

When('I click on the snippet {string} ray button', (key) => {
  cy.get(`div[data-key="${key}"] button:last-child`).click();
});

When('I rightclick on the element {string} of the editor', (/** @type {string} */ query) => {
   // Replace the selector with your TinyMCE iframe
  cy.frameLoaded('iframe.tox-edit-area__iframe'); // iframe selector
  cy.iframe()
    .find(query)
    .eq(0)       // index 0 → first element
    .rightclick();
});

Then('I should see {string} in a modal', (/** @type {string}*/ text) => {
  // Wait for modal to appear (assuming modal is outside iframe)
  cy.get('.modal-dialog', { timeout: 10000 })
    .should('be.visible')
    .contains(text);
});

Then('I should see the text {string} in the editor', (/** @type {string} */ text) => {
  // Replace the selector with your TinyMCE iframe
  cy.frameLoaded('iframe.tox-edit-area__iframe'); // iframe selector
  cy.iframe()
    .should('contain.text', text);
});

Then('I should see the element {string} in the editor', (/** @type {string} */ query) => {
  // Replace the selector with your TinyMCE iframe
  cy.frameLoaded('iframe.tox-edit-area__iframe'); // iframe selector
  cy.iframe()
    .find(query)
    .should('exist');
});