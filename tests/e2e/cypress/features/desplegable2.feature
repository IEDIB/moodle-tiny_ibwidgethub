Feature: Widget desplegable2 feature

  Background: Login Moodle
    Given I am logged in as user "admin"
    And The default language code is "en"
    And The default editor is TinyMCE

  Scenario: Inserts a desplegable2 with the main button
    When I edit a blank "page"
    And I clear the editor "page"
    Then I should not see the element "div.accordion.iedib-accordion" in the "editor"
    And I click the toolbar button "tiny_ibwidgethub"
    Then I should see the text "Select a widget" in the "modal"
    And I click on the snippet "desplegable2" main button
    Then I should see the text "Edit" in the "modal"
    And I set the modal control "nombre" to "2"
    And I set the modal control "independents" to "true"
    And I click the button "Accept" in the modal
    Then I should see 2 elements "div.accordion-group" in the "editor"
    And I click the button "Cancel" in the page

  Scenario: Inserts a desplegable2 with the ray button
    When I edit a blank "page"
    And I clear the editor "page"
    Then I should not see the element "div.accordion.iedib-accordion" in the "editor"
    And I click the toolbar button "tiny_ibwidgethub"
    Then I should see the text "Select a widget" in the "modal"
    And I click on the snippet "desplegable2" ray button
    Then I should see the element "div.accordion.iedib-accordion" in the "editor"
    And I click the button "Cancel" in the page

  Scenario: Context menu actions on accordion groups
    When I edit a blank "page"
    And I clear the editor "page"
    Then I should not see the element "div.accordion.iedib-accordion" in the "editor"
    And I click the toolbar button "tiny_ibwidgethub"
    Then I should see the text "Select a widget" in the "modal"
    And I click on the snippet "desplegable2" ray button
    Then I should see 1 elements "div.accordion-group" in the "editor"

    And I rightclick on the element "div.accordion-group:nth-child(1)" of the editor
    Then I should see a context menu including items '["Move up", "Move down", "Insert", "Remove", "To a list"]'
    And I click the context menu item "Insert"
    Then I should see 2 elements "div.accordion-group" in the "editor"
    And I rightclick on the element "div.accordion-group:nth-child(2)" of the editor
    Then I should see a context menu including items '["Move up", "Move down", "Insert", "Remove", "To a list"]'
    And I click the context menu item "Remove"
    Then I should see 1 elements "div.accordion-group" in the "editor"
    And I rightclick on the element "div.accordion-group:nth-child(1)" of the editor
    Then I should see a context menu including items '["Move up", "Move down", "Insert", "Remove", "To a list"]'
    And I click the context menu item "To a list"
    Then I should not see the element "div.accordion.iedib-accordion" in the "editor"
    And I should see 1 elements "ul > li" in the "editor"
    
    And I click the button "Cancel" in the page