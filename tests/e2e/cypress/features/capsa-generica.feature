Feature: Widget capsa-generica feature

  Background: Login Moodle
    Given I am logged in as user "admin"
    And The default language code is "en"
    And The default editor is TinyMCE

  Scenario: Inserts a capsa-generica with the main button
    When I edit a blank "page"
    And I clear the editor "page"
    Then I should not see the element "div.iedib-capsa" in the "editor"
    And I click the toolbar button "tiny_ibwidgethub"
    Then I should see the text "Select a widget" in the "modal"
    And I click on the snippet "capsa-generica" main button
    Then I should see the text "Edit" in the "modal"
    And I set the modal control "severity" to "important"
    And I set the modal control "mida" to "mitjana"
    And I set the modal control "closable" to "true"
    And I click the button "Accept" in the modal
    Then I should see the element "div.iedib-capsa.iedib-important-border.alert.alert-dismissible" in the "editor"
    And I click the button "Cancel" in the page

  Scenario: Inserts a capsa-generica with the ray button
    When I edit a blank "page"
    And I clear the editor "page"
    Then I should not see the element "div.iedib-capsa" in the "editor"
    And I click the toolbar button "tiny_ibwidgethub"
    Then I should see the text "Select a widget" in the "modal"
    And I click on the snippet "capsa-generica" ray button
    Then I should see the element "div.iedib-capsa.iedib-alerta-border" in the "editor"
    And I click the button "Cancel" in the page

  Scenario: Edits the widget with the contextmenu
    When I edit a blank "page"
    And I clear the editor "page"
    Then I should not see the element "div.iedib-capsa" in the "editor"
    And I click the toolbar button "tiny_ibwidgethub"
    Then I should see the text "Select a widget" in the "modal"
    And I click on the snippet "capsa-generica" ray button
    Then I should see the element "div.iedib-capsa.iedib-alerta-border" in the "editor"

    And I rightclick on the element "div.iedib-capsa" of the editor
    Then I should see a context menu with items '["Language", "Size", "Printable", "Properties", "Type", "Unwrap"]'
    And I click the context menu item "Properties"
    Then I should see the text "Edit" in the "modal"
    And I set the modal control "closable" to "true"
    And I click the button "Accept" in the modal
    Then I should see the element "div.iedib-capsa.alert.alert-dismissible" in the "editor"

    And I rightclick on the element "div.iedib-capsa" of the editor
    Then I should see a context menu with items '["Language", "Size", "Printable", "Properties", "Type", "Unwrap"]'
    And I click the context menu item "Printable"
    Then I should see the element "div.iedib-capsa.d-print-none" in the "editor"

    And I rightclick on the element "div.iedib-capsa" of the editor
    Then I should see a context menu with items '["Language", "Size", "Printable", "Properties", "Type", "Unwrap"]'
    And I click the context menu item "Unwrap"
    Then I should not see the element "div.iedib-capsa" in the "editor"
    And I should see the text "Lorem ipsum" in the "editor"
    And I click the button "Cancel" in the page
