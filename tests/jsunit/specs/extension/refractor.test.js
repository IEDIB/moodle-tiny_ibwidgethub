jest.mock('../../src/options', () => ({
  getGlobalConfig: jest.fn(),
}));
jest.mock('../../src/extension', () => ({
  subscribe: jest.fn(),
}));
jest.mock('core/str', () => ({
  get_string: jest.fn(() => Promise.resolve('Save required')),
}));

const refractor = require('../../src/extension/refractor');
/** @type {any} */
const getGlobalConfig = require('../../src/options').getGlobalConfig;
const { get_string } = require('core/str');

describe('idFixingRefractor', () => {
  /** @type {any} */
  let editor;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    editor = Mocks.editorFactory();
    editor.setContent('');
  });

  it('should fix IDs for accordion and tabs elements', () => {
    editor.setContent(`
      <div class="accordion iedib-accordion" id="1"></div>
      <ul class="nav nav-tabs">
        <li><a href="#2"></a></li>
      </ul>
      <div class="tab-pane iedib-tabpane" id="3"></div>
    `);

    const result = refractor.idFixingRefractor(editor);

    expect(editor.getBody().querySelector('.accordion').id).toBe('f_1');
    expect(editor.getBody().querySelector('.tab-pane').id).toBe('f_3');
    expect(editor.getBody().querySelector('ul.nav a').getAttribute('href')).toBe('#f_2');

    expect(result).toBe(true);
  });

  it('should return false when no IDs to fix', () => {
    editor.setContent(`<p>No ids here</p>`);

    const result = refractor.idFixingRefractor(editor);

    expect(result).toBe(false);
  });
});

describe('refractoring', () => {
  /** @type {any} */
  let editor;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    editor = Mocks.editorFactory();
    editor.setContent('');
  });

  it('should not show notification if no changes', async () => {
    getGlobalConfig.mockReturnValue('0');
    editor.setContent(`<div class="accordion iedib-accordion" id="1"></div>`);

    await refractor.refractoring(editor);

    expect(editor.notificationManager.open).not.toHaveBeenCalled();
  });

  it('should show notification if changes made', async () => {
    getGlobalConfig.mockReturnValue('1');
    editor.setContent(`
      <div class="accordion iedib-accordion" id="1"></div>
      <ul class="nav nav-tabs">
        <li><a href="#2"></a></li>
      </ul>
      <div class="tab-pane iedib-tabpane" id="3"></div>
    `);

    await refractor.refractoring(editor);

    expect(editor.notificationManager.open).toHaveBeenCalledWith({
      text: 'Save required',
      type: 'warning',
      timeout: 4000,
    });

    // IDs are updated
    expect(editor.getBody().querySelector('.accordion').id).toBe('f_1');
    expect(editor.getBody().querySelector('.tab-pane').id).toBe('f_3');
    expect(editor.getBody().querySelector('ul.nav a').getAttribute('href')).toBe('#f_2');
  });
});

describe('idFixingRefractor - repeated IDs', () => {
  /** @type {any} */
  let editor;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    editor = Mocks.editorFactory();
    editor.setContent('');
  });

  it('should fix repeated IDs in multiple accordions', () => {
    editor.setContent(`
      <div class="accordion iedib-accordion" id="1">
        <a class="accordion-toggle" data-toggle="collapse" href="#1">Toggle 1</a>
      </div>
      <div class="accordion iedib-accordion" id="1">
        <a class="accordion-toggle" data-bs-toggle="collapse" href="#1">Toggle 2</a>
      </div>
    `);

    const result = refractor.idFixingRefractor(editor);

    const accordions = editor.getBody().querySelectorAll('.accordion.iedib-accordion');
    expect(accordions[0].id).toMatch(/f_.*/);
    expect(accordions[1].id).toMatch(/f_.*/); // Each accordion gets prefixed independently
    // The fix detects equal id's and changes them
    expect(accordions[0].id).not.toEqual(accordions[1].id);

    // Check that the <a> tags inside the accordions updated their data-parent attributes
    const links = editor.getBody().querySelectorAll('.accordion-toggle');
    expect(links[0].getAttribute('data-parent')).toBe('#f_1');
    expect(links[0].getAttribute('data-bs-parent')).toBe('#f_1');
    expect(links[1].getAttribute('data-parent')).toBe('#f_1');
    expect(links[1].getAttribute('data-bs-parent')).toBe('#f_1');

    expect(result).toBe(true);
  });
});