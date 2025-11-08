import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

/** @type {string | null} */
let lastVisitedEditor = null;

/**
 * Returns a Cypress chain scoped to the last (or newly found) TinyMCE editor iframe.
 * @returns {Cypress.Chainable<JQuery<HTMLBodyElement>>}
 */
function getLastVisitedEditor() {
  if (lastVisitedEditor) {
    return cy.frameLoaded(lastVisitedEditor).iframe(lastVisitedEditor);
  }
  // Fallback to the last editor in the page
  return cy.get('iframe.tox-edit-area__iframe')
    .last()
    .should('exist')
    .then(($iframe) => {
      const id = $iframe.attr('id');
      expect(id, 'iframe should have an id').to.be.a('string');
      if (!id) {
        throw new Error('Iframe has no id');
      }
      lastVisitedEditor = `#${id}`;
      return cy.frameLoaded(lastVisitedEditor).iframe(lastVisitedEditor);
    });
}

/* ---------------------- GIVEN STEPS ---------------------- */

Given("I am logged in as user {string}", (/** @type {string} */ username) => {
  let pwd = "12345";
  if (username !== 'admin') {
    cy.log(`Unknown user ${username}`);
  }
  cy.visit("/login/index.php");
  cy.get("#username").type(username);
  cy.get("#password").type(pwd);
  cy.get("#loginbtn").click();

  // Confirm login success (Moodle-specific selector)
  cy.get("body").should("contain.text", username);
});

Given("The default editor is TinyMCE", () => {
  // This can be an API check or UI verification
  cy.request("/user/editor.php?id=2&course=1")
    .its("body")
    .should("include", '<option value="tiny" selected');

});

Given("The default language code is {string}", (/** @type {string}*/ langCode) => {
  cy.request("/user/language.php?id=2&course=1")
    .its("body")
    .should("include", '<option value="en" selected');
});

/* ---------------------- WHEN STEPS ---------------------- */

When("I edit the user profile", () => {
  cy.visit("/user/editadvanced.php?id=2&course=1");
  cy.get("iframe.tox-edit-area__iframe", { timeout: 10000 })
    .should("exist");
});

When("I edit a blank {string}", (/** @type {string}*/ resource) => {
  // resource === page
  let url = "/course/modedit.php?add=page&type&course=1&section=0&return=0&beforemod=0";
  if (resource === 'page') {
    url = "/course/modedit.php?add=page&type&course=1&section=0&return=0&beforemod=0";
  } else {
    cy.log(`Unkown Moodle resource ${resource}`);
  }
  const activityName = `Activity ${Math.random().toString(32).substring(2)}`;
  cy.visit(url)
    .get('input#id_name', {timeout: 5000})
    .type(activityName);

  cy.get("iframe.tox-edit-area__iframe", { timeout: 10000 })
    .should("exist")
  cy.scrollTo(0);
});

When('I click the editor {string}', (formId) => {
  const selector = `iframe#id_${formId}_ifr.tox-edit-area__iframe`;
  cy.frameLoaded(selector);
  cy.iframe(selector)
    .click();
  // Update the current editor
  lastVisitedEditor = selector;
});

When('I clear the editor {string}', (formId) => {
  const selector = `iframe#id_${formId}_ifr.tox-edit-area__iframe`;
  cy.frameLoaded(selector);
  cy.wait(2000);
  cy.iframe(selector)
    .click()
    .type("{selectall}{backspace}");
  // Update the current editor
  lastVisitedEditor = selector;
});

When('I type {string} in the editor', (/** @type {string} */ text) => {
  getLastVisitedEditor()
    .type(text);
});

When('I click the button {string} in the page', (/** @type {string}*/ buttonName) => {
  cy.get(`input[type="submit"][value="${buttonName}"]`)
    .click();
});

When('I click the button {string} in the modal', (/** @type {string}*/ buttonName) => {
  cy.get(".modal-dialog")        // get the modal container
    .should("be.visible")          // make sure it's visible
    .contains("button", buttonName) // find a <button> with text "Cancel"
    .click();
});

When('I click the toolbar button {string}', (/** @type {string}*/ buttonName) => {
  if (!lastVisitedEditor) {
    throw new Error("No editor selected. Please click or select an editor first.");
  }

  cy.get(lastVisitedEditor) // start in the parent DOM
    .closest('div[role="application"]')
    .within(() => {
      cy.get(
        `button[data-mce-name="${buttonName}"],
         div[data-mce-name="${buttonName}"][role="button"] span.tox-tbtn:first-child`
      )
        .should("exist")
        .last()
        .click({ force: true });
    });
});

When('I click the toolbar split button {string}', (/** @type {string}*/ buttonName) => {
  if (!lastVisitedEditor) {
    throw new Error("No editor selected. Please click or select an editor first.");
  }

  cy.get(lastVisitedEditor) // start in the parent DOM
    .closest('div[role="application"]')
    .within(() => {
      cy.get(
        `button[data-mce-name="${buttonName}"],
         div[data-mce-name="${buttonName}"][role="button"] span.tox-tbtn:last-child`
      )
        .should("exist")
        .last()
        .click({ force: true });
    });
});

When('I click on the snippet {string} main button', (key) => {
  cy.get(`div[data-key="${key}"] button:first-child`)
    .last()
    .click();
});

When('I click on the snippet {string} ray button', (key) => {
  cy.get(`div[data-key="${key}"] button:last-child`)
    .last()
    .click();
});

When('I rightclick on the element {string} of the editor', (/** @type {string} */ query) => {
  cy.wait(2000);
  getLastVisitedEditor()
    .find(query)
    .eq(0)
    .rightclick();
});

When("I click the context menu item {string}", (/** @type {string} */ itemName) => {
  if (!lastVisitedEditor) {
    throw new Error("No editor selected. Please click or select an editor first.");
  }

  // Wait for the context menu to appear
  cy.get(".tox-menu.tox-collection", { timeout: 10000 })
    .should("be.visible")
    .contains(".tox-collection__item", itemName)
    .click({ force: true });

});


/**
 * Step to set the value of a modal control (select, checkbox, text input, textarea)
 */
When(
  "I set the modal control {string} to {string}", (/** @type {string}*/ controlName, /** @type {string}*/ value) => {
    cy.get(".modal-body:visible").within(() => {
      cy.get(
        `select[name="${controlName}"], input[name="${controlName}"], textarea[name="${controlName}"]`
      ).then($el => {
        if (!$el.length) {
          throw new Error(`Control with name or id "${controlName}" not found in modal`);
        }

        const el = $el[0];
        const tag = el.tagName.toLowerCase();
        // @ts-ignore
        const type = el.type?.toLowerCase();

        if (tag === "select") {
          cy.wrap(el).select(String(value));
        } else if (tag === "input" && type === "checkbox") {
          // @ts-ignore
          const isChecked = el.checked;
          if (Boolean(value) !== isChecked) {
            cy.wrap(el).click();
          }
        } else if ((tag === "input" && type === "text") || tag === "textarea") {
          cy.wrap(el).clear().type(String(value));
        } else if (tag === "input" && type === "number") {
          cy.wrap(el).clear().type(String(value));
        } else {
          throw new Error(`Control with name or id "${controlName}" has unsupported type: ${tag}[${type}]`);
        }
      });
    });


});

/* ---------------------- THEN STEPS ---------------------- */

Then('I should see the text {string} in the {string}', (/** @type {string}*/ text, /** @type {string}*/ where) => {
  if (where === 'modal') {
    // Wait for modal to appear (assuming modal is outside iframe)
    cy.get('.modal-dialog', { timeout: 10000 })
      .should('be.visible')
      .contains(text);
  } else if (where === 'page') {
    cy.should('contain', text);
  } else if (where === 'editor') {
    getLastVisitedEditor()
      .should('contain', text);
  } else {
    cy.log(`The place ${where} is not defined`);
  }
});

Then('I should not see the text {string} in the {string}', (/** @type {string}*/ text, /** @type {string}*/ where) => {
  if (where === 'modal') {
    // Wait for modal to appear (assuming modal is outside iframe)
    cy.get('.modal-dialog', { timeout: 10000 })
      .should('be.visible')
      .should('not.contain', text);
  } else if (where === 'page') {
    // Wait for modal to appear (assuming modal is outside iframe)
    cy.should('not.contain', text);
  } else if (where === 'editor') {
    getLastVisitedEditor()
      .should('not.contain', text);
  } else {
    cy.log(`The place ${where} is not defined`);
  }
});

Then('I should see the element {string} in the {string}', (/** @type {string} */ query, /** @type {string} */ where) => {
   if (where === 'modal') {
    // Wait for modal to appear (assuming modal is outside iframe)
    cy.get('.modal-dialog', { timeout: 10000 })
      .find(query)
      .should('be.visible');
  } else if (where === 'page') {
    // Wait for modal to appear (assuming modal is outside iframe)
    cy.get(query, { timeout: 10000 })
      .should('be.visible');
  } else if (where === 'editor') {
     getLastVisitedEditor()
      .find(query)
      .should('be.visible');
  } else {
    cy.log(`The place ${where} is not defined`);
  } 
});

Then('I should see {int} elements {string} in the {string}', (/** @type {number} */ count, /** @type {string} */ query, /** @type {string} */ where) => {
  cy.wait(2000);
  if (where === 'modal') {
    // Wait for modal to appear (assuming modal is outside iframe)
    cy.get('.modal-dialog', { timeout: 10000 })
      .find(query)
      .should('have.length', count);
  } else if (where === 'page') {
    // Wait for modal to appear (assuming modal is outside iframe)
    cy.get(query, { timeout: 10000 })
      .should('have.length', count);
  } else if (where === 'editor') {
     getLastVisitedEditor()
      .find(query)
      .should('have.length', count);
  } else {
    cy.log(`The place ${where} is not defined`);
  } 
});

Then('I should not see the element {string} in the {string}', (/** @type {string} */ query, /** @type {string} */ where) => {
   if (where === 'modal') {
    // Wait for modal to appear (assuming modal is outside iframe)
    cy.get('.modal-dialog', { timeout: 10000 })
      .find(query)
      .should('not.exist');
  } else if (where === 'page') {
    // Wait for modal to appear (assuming modal is outside iframe)
    cy.get(query, { timeout: 10000 })
      .should('not.exist');
  } else if (where === 'editor') {
     getLastVisitedEditor()
      .find(query)
      .should('not.exist');
  } else {
    cy.log(`The place ${where} is not defined`);
  } 
});


Then('I should see a context menu with items {string}', (/** @type {string} */ itemsJson) => {
  /**
   * @type {string[]}
   */
  let expectedItems;
  try {
    expectedItems = JSON.parse(itemsJson);
  } catch (err) {
    cy.log("Invalid JSON format for menu items.");
    return;
  }

  if (!lastVisitedEditor) {
    throw new Error("No editor selected. Please click or select an editor first.");
  }

  cy.get(".tox-menu.tox-collection", { timeout: 10000 })
    .should("be.visible")
    .find(".tox-collection__item")
    .then(($items) => {
      const actual = [...$items].map((el) => el.innerText.trim()).filter(Boolean);
      const expected = expectedItems.map((x) => x.trim());
      expect(actual.sort()).to.deep.equal(expected.sort());
    });

});


Then('I should see a context menu including items {string}', (/** @type {string} */ itemsJson) => {
  /**
   * @type {string[]}
   */
  let expectedItems;
  try {
    expectedItems = JSON.parse(itemsJson);
  } catch (err) {
    cy.log("Invalid JSON format for menu items.");
    return;
  }

  if (!lastVisitedEditor) {
    throw new Error("No editor selected. Please click or select an editor first.");
  }

  cy.get(".tox-menu.tox-collection", { timeout: 10000 })
    .should("be.visible")
    .find(".tox-collection__item")
    .then(($items) => {
      const actual = [...$items].map(el => el.innerText.trim()).filter(Boolean);

      // Check each expected item exists somewhere in the actual menu items
      expectedItems.forEach(item => {
        expect(actual).to.include(item.trim());
      });
    });

});