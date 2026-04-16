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
// @ts-ignore
const prefix = refractor.prefix;
/** @type {any} */
const getGlobalConfig = require('../../src/options').getGlobalConfig;

describe('idFixingRefractor', () => {
  /** @type {any} */
  let editor;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    editor = global.Mocks.editorFactory();
    editor.setContent('');
  });

  it('should fix IDs for accordion and tabs elements', () => {
    editor.setContent(`
      <div class="accordion iedib-accordion" id="1"></div>

      <div class="tab-pane iedib-tabpane" id="3"></div>

      <div class="tab-pane iedib-tabpane" id="2">
      </div>

      <ul class="nav nav-tabs">
        <li><a href="#collapse_2_1"></a></li>
      </ul>
    `);

    const result = refractor.idFixingRefractor(editor);

    expect(editor.getBody().querySelector('.accordion').id).toBe(`${prefix}1`);
    const tabMenus = editor.getBody().querySelectorAll('.tab-pane');
    expect(tabMenus[0].id).toBe(`${prefix}3`);
    expect(tabMenus[1].id).toBe(`${prefix}2`);

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
    editor = global.Mocks.editorFactory();
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
    expect(editor.getBody().querySelector('.accordion').id).toBe(`${prefix}1`);
    expect(editor.getBody().querySelector('.tab-pane').id).toBe(`${prefix}3`);
    expect(editor.getBody().querySelector('ul.nav a').getAttribute('href')).toBe(`#${prefix}2`);
  });
});

describe('idFixingRefractor - repeated IDs', () => {
  /** @type {any} */
  let editor;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    editor = global.Mocks.editorFactory();
    editor.setContent('');
  });

  it('should fix repeated IDs in multiple accordions', () => {
    editor.setContent(`
      <div class="accordion iedib-accordion" id="1">
        <a class="accordion-toggle" data-toggle="collapse" href="#collapse_1"
        data-parent="#1" data-bs-parent="#1">Toggle 1</a>
        <div id="collapse_1" class="accordion-body collapse">
          body 1
        </div>
      </div>
      <div class="accordion iedib-accordion" id="1">
        <a class="accordion-toggle" data-bs-toggle="collapse" href="#collapse_1"
         data-parent="#1" data-bs-parent="#1">Toggle 2</a>
         <div id="collapse_1" class="accordion-body collapse">
          body 2
        </div>
      </div>
    `);

    const result = refractor.idFixingRefractor(editor);

    const accordions = editor.getBody().querySelectorAll('.accordion.iedib-accordion');
    expect(accordions[0].id).toMatch(/f.*/);
    expect(accordions[1].id).toMatch(/f.*/); // Each accordion gets prefixed independently
    // The fix detects equal id's and changes them
    expect(accordions[0].id).not.toEqual(accordions[1].id);

    // Check that the <a> tags inside the accordions updated their data-parent attributes
    const links = editor.getBody().querySelectorAll('.accordion-toggle');
    expect(links[0].getAttribute('data-parent')).toBe(`#${prefix}1`);
    expect(links[0].getAttribute('data-bs-parent')).toBe(`#${prefix}1`);
    expect(links[0].getAttribute('href')).toBe(`#collapse_${prefix}1_1`);
    expect(links[1].getAttribute('data-parent')).toBe(`#${prefix}1v1`);
    expect(links[1].getAttribute('data-bs-parent')).toBe(`#${prefix}1v1`);
    expect(links[1].getAttribute('href')).toBe(`#collapse_${prefix}1v1_1`);

    const bodies = editor.getBody().querySelectorAll('.accordion-body');
    expect(bodies[0].id).toBe(`collapse_${prefix}1_1`);
    expect(bodies[1].id).toBe(`collapse_${prefix}1v1_1`);

    expect(result).toBe(true);
  });


  it('should fix repeated IDs in multiple tabmenus', () => {
 editor.setContent(`
      <div class="tabbable iedib-tabmenu">
      <ul class="nav nav-tabs">
        <li class="active"><a href="#75_1" data-toggle="tab" data-bs-toggle="tab">
          <span>&nbsp;</span><span>Pestanya1 - INSTANCE 1</span></a></li>
        <li><a href="#75_2" data-toggle="tab" data-bs-toggle="tab">
          <span>&nbsp;</span><span>Pestanya2 - INSTANCE 1</span></a></li>
      </ul>
      <div class="tab-content">
        <div class="tab-pane active iedib-tabpane" id="75_1">
          <p>LOREM 1 - INSTANCE 1</p>
        </div>
         <div class="tab-pane active iedib-tabpane" id="75_2">
          <p>LOREM 2 - INSTANCE 1</p>
        </div>
      </div>
      </div> 


      <div class="tabbable iedib-tabmenu">
      <ul class="nav nav-tabs">
        <li class="active"><a href="#75_1" data-toggle="tab" data-bs-toggle="tab">
          <span>&nbsp;</span><span>Pestanya1 - INSTANCE 2</span></a></li>

        <li class="active"><a href="#75_6" data-toggle="tab" data-bs-toggle="tab">
          <span>&nbsp;</span><span>Lost and fixed</span></a></li>
      </ul>
      <div class="tab-content">
        <div class="tab-pane active iedib-tabpane" id="75_1">
          <p>LOREM 1 - INSTANCE 2</p>
        </div>
      </div>
      </div> 
    `);

    const result = refractor.idFixingRefractor(editor);

    const tabmenus = editor.getBody().querySelectorAll('.tabbable');
    expect(tabmenus.length).toBe(2);

    // Firt menu
    let tabpanes = tabmenus[0].querySelectorAll('.tab-pane');
    expect(tabpanes.length).toBe(2);
    expect(tabpanes[0].id).toBe(`${prefix}75_1`);
    expect(tabpanes[1].id).toBe(`${prefix}75_2`);

    let anchors = tabmenus[0].querySelectorAll('a');
    expect(anchors.length).toBe(2);
    expect(anchors[0].getAttribute('href')).toBe(`#${prefix}75_1`);
    expect(anchors[1].getAttribute('href')).toBe(`#${prefix}75_2`);

    // Second menu should fix repeated id
    tabpanes = tabmenus[1].querySelectorAll('.tab-pane');
    expect(tabpanes.length).toBe(1);
    expect(tabpanes[0].id).toBe(`${prefix}75_1v1`);

    anchors = tabmenus[1].querySelectorAll('a');
    expect(anchors.length).toBe(2);
    expect(anchors[0].getAttribute('href')).toBe(`#${prefix}75_1v1`);
    expect(anchors[1].getAttribute('href')).toBe(`#${prefix}75_6`);

    expect(result).toBe(true);
  });

});