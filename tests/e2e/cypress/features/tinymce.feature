Feature: TinyMCE plugin in Moodle

  Scenario: Open the plugin modal
    Given I am logged in as an admin
    When I open the profile with the TinyMCE editor
    And I click the toolbar button "overflow-button"
    And I click the toolbar button "tiny_ibwidgethub"
    Then I should see "Select a widget" in a modal
    And I click on the snippet "bs-badge" ray button
    Then I should see the text "Lorem ipsum" in the editor
    And I click on the element "span.badge" of the editor
    Then I should see a context menu with options ""