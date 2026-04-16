Feature: Widget bs-badge feature

  Background: Login Moodle
    Given I am logged in as user "admin"
    And The default language code is "en"
    And The default editor is TinyMCE

  Scenario: Inserts a bs-badge with the main button
    When I edit a blank "page"
    And I clear the editor "page"
    Then I should not see the element "span.badge" in the "editor"
    And I click the toolbar button "tiny_ibwidgethub"
    Then I should see the text "Select a widget" in the "modal"
    And I click on the snippet "bs-badge" main button
    Then I should see the text "Edit" in the "modal"
    And I set the modal control "severity" to "warning"
    And I set the modal control "pill" to "false"
    And I click the button "Accept" in the modal
    Then I should see the element "span.badge.badge-warning" in the "editor"
    And I click the button "Cancel" in the page

  Scenario: Inserts a bs-badge with the ray button
    When I edit a blank "page"
    And I clear the editor "page"
    Then I should not see the element "span.badge" in the "editor"
    And I click the toolbar button "tiny_ibwidgethub"
    Then I should see the text "Select a widget" in the "modal"
    And I click on the snippet "bs-badge" ray button
    Then I should see the text "Lorem ipsum" in the "editor"
    And I click the button "Cancel" in the page

  Scenario: Edits the widget with the contextmenu
    When I edit a blank "page"
    And I clear the editor "page"
    Then I should not see the element "span.badge" in the "editor"
    And I click the toolbar button "tiny_ibwidgethub"
    Then I should see the text "Select a widget" in the "modal"
    And I click on the snippet "bs-badge" ray button
    Then I should see the text "Lorem ipsum" in the "editor"

    And I rightclick on the element "span.badge" of the editor
    Then I should see a context menu with items '["Properties", "Unwrap"]'
    And I click the context menu item "Properties"
    Then I should see the text "Edit" in the "modal"
    And I set the modal control "severity" to "danger"
    And I set the modal control "pill" to "true"
    And I click the button "Accept" in the modal
    Then I should see the element "span.badge.badge-danger.badge-pill" in the "editor"
    And I rightclick on the element "span.badge" of the editor
    Then I should see a context menu with items '["Properties", "Unwrap"]'
    And I click the context menu item "Unwrap"
    Then I should not see the element "span.badge" in the "editor"
    And I should see the text "Lorem ipsum" in the "editor"
    And I click the button "Cancel" in the page