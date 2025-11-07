jest.mock('../../src/service/userstorage_service', () => {
    const getFromLocal = jest.fn().mockReturnValue('#FFFFFF');
    const setToLocal = jest.fn();
    return ({
    __esModule: true,
        getUserStorage: () => ({
            getFromLocal,
            setToLocal
        })
    })
});

import {provider} from '../../src/extension/contextmenus';
import Common from '../../src/common';
import { htmlToElement, toRgba } from '../../src/util';

const actionKeys = [
            // Image actions
            'imageEffectsNestedMenu',
            'imageSwitchToSnippet',

            // Box actions
            'changeBoxLanguageNestedMenu',
            'changeBoxSizeNestedMenu',
            'changeBoxSeverityNestedMenu',
            'switchBoxRowsExample',
            'switchBoxSimpleExample',

            // Others
            'accordionIndependentBehaviorNestedMenu',
            'numberedListNestedMenu',
            'twoColumnsNestedMenu',
            'convertDropdownToList',

            // Tables
            'tablesMaxWidthMenu',
            'convertToBsTableMenu',
            'convertToPredefinedTableMenu',
            'responsivenessNestedMenu',
            'tablesHeaderNestedMenu',
            'tablesFooterNestedMenu',
            'tablesCellColorNestedMenu',
            'tablesRowColorNestedMenu',
        ];
/**
 * @param {any[]} lst 
 * @returns {Record<string, any>}
 */
function convertToDict(lst) {
    return Object.fromEntries(actionKeys.map((key, i) => [key, lst[i]]));
}

describe('custom contextmenus actions', () => {
    /** @type {*} */
    let editor;

    beforeEach(() => {
        jest.clearAllMocks();
        editor = global.Mocks.editorFactory();
    });

    it('imageEffectsNestedMenu should create menu items and execute actions', async() => {
        /** @type {*} */
        const ctx = {editor, path: {selectedElement: editor.getBody()}, actionPaths: {}};
        let lst = await provider(ctx);
        let menu = convertToDict(lst).imageEffectsNestedMenu;
        expect(typeof menu).toBe('object');
        expect(menu.subMenuItems()).toStrictEqual([]);

        // Should show remove effect
        editor.setContent('<div class="iedib-figure" data-snptd="zoom"></div>');
        ctx.path.elem = editor.getBody().querySelector('.iedib-figure');
        lst = await provider(ctx);
        menu = convertToDict(lst).imageEffectsNestedMenu;
        let subitems = menu.subMenuItems();
        expect(subitems).toHaveLength(1);
        expect(subitems[0].icon).toBe('remove');
        // Test action
        subitems[0].onAction();
        expect(editor.getBody().querySelector('[data-snptd]')).toBe(null);
        expect(editor.getBody().querySelector(`div.${Common.jsAreaClassname}`)).toBeFalsy();

        // Should show add effects
        editor.setContent('<div class="iedib-figure"></div>');
        ctx.path.elem = editor.getBody().querySelector('.iedib-figure');
        ctx.path.widget = {requires: {url: 'https://test.com/figure.min.js', query: 'div.iedib-figure[data-snptd]'}};
        lst = await provider(ctx);
        menu = convertToDict(lst).imageEffectsNestedMenu;
        subitems = menu.subMenuItems();
        expect(subitems).toHaveLength(2);
        expect(subitems[0].tooltip).toBe('zoom');
        expect(subitems[1].tooltip).toBe('lightbox');
        // Test action
        subitems[0].onAction();
        expect(editor.getBody().querySelector('[data-snptd="zoom"]')).toBeTruthy();
        expect(editor.getBody().querySelector('[data-snptd="lightbox"]')).toBeFalsy();
        expect(editor.getBody().querySelectorAll(`div.${Common.jsAreaClassname} > script`).length).toBe(1);
    });

        it('imageSwitchToSnippet should only trigger for <img> elements', async () => {
        /** @type {*} */
        const ctx = {editor, path: {selectedElement: editor.getBody()}, actionPaths: {}};
        let lst = await provider(ctx);
        const menu = convertToDict(lst).imageSwitchToSnippet;
        expect(typeof menu.condition).toBe('function');
        editor.setContent('<img src="a.png">');
        const img = editor.getBody().querySelector('img');
        ctx.path.selectedElement = img;
        ctx.path.widget = {key: 'imatge'}; // should skip
        expect(menu.condition()).toBe(false);
        ctx.path.widget.key = 'not-img';
        expect(menu.condition()).toBe(true);
        expect(ctx.path.targetElement).toBe(img);
    });

    it('changeBoxLanguageNestedMenu should show supported languages and mark current', async () => {
        /** @type {*} */
        const ctx = {editor, path: {elem: document.createElement('div')}, actionPaths: {}};
        ctx.path.elem.setAttribute('data-lang', 'es');
        let lst = await provider(ctx);
        const menu = convertToDict(lst).changeBoxLanguageNestedMenu;
        /** @type {any[]} */
        const subitems = menu.subMenuItems();
        expect(subitems).toHaveLength(5);
        expect(subitems.find(i => i.icon === 'checkmark').text).toMatch(/Castell/);
    });

    it('changeBoxSizeNestedMenu should use SUPPORTED_SIZES and mark selected one', async () => {
        const div = document.createElement('div');
        div.classList.add('iedib-capsa-mitjana');
        /** @type {*} */
        const ctx = {editor, path: {elem: div, widget: {parameters: []}}, actionPaths: {}};
        const lst = await provider(ctx);
        const menu = convertToDict(lst).changeBoxSizeNestedMenu;
        /** @type {any[]} */
        const subitems = menu.subMenuItems();
        expect(subitems).toHaveLength(3);
        expect(subitems.find(i => i.icon === 'checkmark')).toBeTruthy();
    });

    it('changeBoxSeverityNestedMenu should produce menu items from severity variable', async () => {
        const div = document.createElement('div');
        div.classList.add('iedib-info-border');
        /** @type {*} */
        const ctx = {editor, path: {elem: div, widget: {parameters: [{name: 'severity', options: [{v: 'info', l: 'Info'}]}]}}, actionPaths: {}};
        const lst = await provider(ctx);
        const menu = convertToDict(lst).changeBoxSeverityNestedMenu;
        const subitems = menu.subMenuItems();
        expect(subitems).toHaveLength(1);
        expect(subitems[0].icon).toBe('checkmark');
    });

    it('twoColumnsNestedMenu should build 6 items including checkmark for current span', async () => {
        const html = `<div class="two-cols"><div class="span6"></div><div class="span6"></div></div>`;
        editor.setContent(html);
        const elem = editor.getBody().querySelector('.two-cols');
        /** @type {*} */
        const ctx = {editor, path: {elem, widget: {}}, actionPaths: {}};
        /** @type {*} */
        const lst = await provider(ctx);
        const menu = convertToDict(lst).twoColumnsNestedMenu;
        /** @type {any[]} */
        const subitems = menu.subMenuItems();
        expect(subitems.some(i => i.icon === 'checkmark')).toBeTruthy();
    });

    it('tablesMaxWidthMenu should open dialog and modify max-width', async () => {
        const div = document.createElement('div');
        div.style.maxWidth = '200px';
        /** @type {*} */
        const ctx = {editor, path: {elem: div}, actionPaths: {}};
        const lst = await provider(ctx);
        const menu = convertToDict(lst).tablesMaxWidthMenu;
        expect(typeof menu.onAction).toBe('function');
        // Mock openInputDialog indirectly triggers style changes
        menu.onAction();
        expect(editor.windowManager.open).toHaveBeenCalled();
        expect(div.style.maxWidth).toContain('px');
    });

    it('tablesHeaderNestedMenu should toggle header rows', async () => {
        const table = document.createElement('table');
        /** @type {*} */
        const ctx = {editor, path: {elem: table}, actionPaths: {}};
        let lst = await provider(ctx);
        let menu = convertToDict(lst).tablesHeaderNestedMenu;
        let subitems = menu.subMenuItems();
        expect(subitems[0].text).toMatch(/add/i);
        table.createTHead();
        lst = await provider(ctx);
        menu = convertToDict(lst).tablesHeaderNestedMenu;
        subitems = menu.subMenuItems();
        expect(subitems[0].text).toMatch(/remove/i);
    });

    it('tablesFooterNestedMenu should toggle footer rows', async () => {
        const table = document.createElement('table');
        /** @type {*} */
        const ctx = {editor, path: {elem: table}, actionPaths: {}};
        let lst = await provider(ctx);
        let menu = convertToDict(lst).tablesFooterNestedMenu;
        let subitems = menu.subMenuItems();
        expect(subitems[0].text).toMatch(/add/i);
        table.createTFoot();
        lst = await provider(ctx);
        menu = convertToDict(lst).tablesFooterNestedMenu;
        subitems = menu.subMenuItems();
        expect(subitems[0].text).toMatch(/remove/i);
    });

    it('tablesCellColorNestedMenu should offer removeBackground when style is present', async () => {
        const td = document.createElement('td');
        td.style.backgroundColor = 'red';
        const ctx = {editor, path: {selectedElement: td}, actionPaths: {}};
        const lst = await provider(ctx);
        const menu = convertToDict(lst).tablesCellColorNestedMenu;
        const subitems = menu.subMenuItems();
        expect(subitems.length).toBe(2);
        expect(subitems[1].text).toMatch(/remove/i);
    });

    it('tablesRowColorNestedMenu should mirror cell behavior at row level', async () => {
        const tr = document.createElement('tr');
        tr.style.backgroundColor = 'blue';
        const ctx = {editor, path: {selectedElement: tr}, actionPaths: {}};
        const lst = await provider(ctx);
        const menu = convertToDict(lst).tablesRowColorNestedMenu;
        const subitems = menu.subMenuItems();
        expect(subitems.length).toBe(2);
        expect(subitems[1].text).toMatch(/remove/i);
    });

    // Additional tests
    it('numberedListNestedMenu should toggle beautified list and update styles', async () => {
        const ol = document.createElement('ol');
        const li = document.createElement('li');
        ol.appendChild(li);
        const ctx = {editor, path: {selectedElement: li}, actionPaths: {}};
        const lst = await provider(ctx);
        const menu = convertToDict(lst).numberedListNestedMenu;
        expect(menu.condition()).toBe(true);
        const subitems = menu.subMenuItems();
        expect(subitems).toHaveLength(2);

        // Toggle beautified list ON
        subitems[0].onAction();
        expect(ol.classList.contains('iedib-falist')).toBe(true);
        expect(ol.style.counterReset).toContain('iedibfalist-counter');

        // Toggle OFF
        subitems[0].onAction();
        expect(ol.classList.contains('iedib-falist')).toBe(false);
    });

    it('accordionIndependentBehaviorNestedMenu should toggle between dependent/independent', async () => {
        const div = document.createElement('div');
        const body = document.createElement('div');
        body.classList.add('accordion-body');
        div.appendChild(body);
        /** @type {any} */
        const ctx = {editor, path: {elem: div}, actionPaths: {}};
        const lst = await provider(ctx);
        const menu = convertToDict(lst).accordionIndependentBehaviorNestedMenu;
        const subitems = menu.subMenuItems();
        expect(subitems).toHaveLength(2);
        // Check onAction binding exists
        expect(typeof subitems[0].onAction).toBe('function');
    });

    it('colorPicker should open dialog, update element style, and store color', async () => {
        
        // Mock windowManager.open so we can capture its options and trigger onSubmit manually
        const selectedColor = '#ABCDEF';
        const openMock = jest.fn((options) => {
            // Simulate TinyMCE color picker returning a color
            const fakeApi = {
                getData: () => ({ value: selectedColor }),
                close: jest.fn()
            };
            const input = htmlToElement(document, `<input type="color" id="tiny_ibwidgethub_colorinput" value="${selectedColor}" style="width:100%; height:50px;"/>`);
            document.body.appendChild(input);
            options.onSubmit(fakeApi);
        });
        
        const editorMock = global.Mocks.editorFactory();
        const getUserStorage = require('../../src/service/userstorage_service').getUserStorage;
        const userStorage = getUserStorage(editorMock);
        editorMock.setContent('<table><tbody><tr><td><span>td content</span></td></tr></tbody></table>');
        const td = editorMock.getBody().querySelector('td');
        editorMock.windowManager.open = openMock;

        // Inject mocks into context
        const ctx = {editor: editorMock, path: {selectedElement: td}, actionPaths: {}};

        // Generate menus
        const lst = await provider(ctx);
        const menu = convertToDict(lst).tablesCellColorNestedMenu;
        expect(menu.condition()).toBe(true);
        /** @type {any[]} */
        const subitems = menu.subMenuItems();
        expect(subitems.length).toBe(1);
        // Find and trigger the color picker submenu
        const colorMenuItem = subitems.find(i => i.text.toLowerCase().includes('background'));
        expect(colorMenuItem).toBeTruthy();

        // Run its onAction callback (this triggers colorPicker internally)
        colorMenuItem.onAction();

        // ✅ Expect the mocked color dialog to have been opened
        expect(openMock).toHaveBeenCalledTimes(1);

        // ✅ The td element should now have inline background color
        expect(td.style.backgroundColor.replace(/ /g, '')).toBe(toRgba(selectedColor, 1));

        // ✅ The color returned (#ABCDEF) should now be stored locally
        expect(userStorage.setToLocal).toHaveBeenCalledWith('pickercolor', selectedColor.toLowerCase(), true);

    });

    it('changeBoxLanguageNestedMenu should return empty when no elem', async () => {
        /** @type {any} */
        const ctx = {editor, path: {}, actionPaths: {}};
        const lst = await provider(ctx);
        const menu = convertToDict(lst).changeBoxLanguageNestedMenu;
        expect(menu.subMenuItems()).toBe('');
    });

    it('changeBoxSizeNestedMenu returns empty when widget missing', async () => {
        /** @type {any} */
        const ctx = {editor, path: {elem: null, widget: null}, actionPaths: {}};
        const lst = await provider(ctx);
        const menu = convertToDict(lst).changeBoxSizeNestedMenu;
        expect(menu.subMenuItems()).toBe('');
    });

    it('tablesRowColorNestedMenu returns empty when not in table', async () => {
        const ctx = {editor, path: {selectedElement: document.createElement('div')}, actionPaths: {}};
        const lst = await provider(ctx);
        const menu = convertToDict(lst).tablesRowColorNestedMenu;
        expect(menu.subMenuItems()).toStrictEqual([]);
    });

    it('responsivenessNestedMenu should detect responsive parent', async () => {
        const table = document.createElement('table');
        const div = document.createElement('div');
        div.classList.add('table-responsive');
        div.appendChild(table);
        /** @type {any} */
        const ctx = {editor, path: {elem: table}, actionPaths: {}};
        const lst = await provider(ctx);
        const menu = convertToDict(lst).responsivenessNestedMenu;
        const subitems = menu.subMenuItems();
        expect(subitems[0].text).toMatch(/remove|add/i);
    });

    it('convertToBsTableMenu and convertToPredefinedTableMenu call onAction', async () => {
        /** @type {any} */
        const ctx = {editor, path: {elem: document.createElement('table')}, actionPaths: {}};
        const lst = await provider(ctx);
        const toBs = convertToDict(lst).convertToBsTableMenu;
        const toPre = convertToDict(lst).convertToPredefinedTableMenu;
        expect(typeof toBs.onAction).toBe('function');
        expect(typeof toPre.onAction).toBe('function');
    });

    it('switchBoxRowsExample and switchBoxSimpleExample trigger their onAction', async () => {
        /** @type {any} */
        const ctx = {editor, path: {}, actionPaths: {}};
        const lst = await provider(ctx);
        const row = convertToDict(lst).switchBoxRowsExample;
        const simple = convertToDict(lst).switchBoxSimpleExample;
        expect(typeof row.onAction).toBe('function');
        expect(typeof simple.onAction).toBe('function');
    });

});