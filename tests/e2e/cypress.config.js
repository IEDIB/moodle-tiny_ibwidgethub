const {defineConfig} = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const {addCucumberPreprocessorPlugin} = require("@badeball/cypress-cucumber-preprocessor");
const {createEsbuildPlugin} = require("@badeball/cypress-cucumber-preprocessor/esbuild");

module.exports = defineConfig({
  e2e: {
    viewportWidth: 1920,
    viewportHeight: 1080,
    specPattern: "**/*.feature",
    baseUrl: "http://localhost:4545/", // Adjust to your Moodle URL
    setupNodeEvents(on, config) {
      // Add Cucumber support
      addCucumberPreprocessorPlugin(on, config);
      // @ts-ignore
      on("file:preprocessor", createBundler({
        plugins: [createEsbuildPlugin(config)],
      }));
      return config;
    },
  },
});
