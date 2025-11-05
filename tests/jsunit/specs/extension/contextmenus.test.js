import {provider} from '../../src/extension/contextmenus';
import Common from '../../src/common';

const widget = {
    selectors: 'div.iedib-img',
    requires: {url: '/sd/images.min.js', query: 'div.iedib-img[data-snptd="zoom"]'},
};

/**
 * 
 * @param {string} html 
 * @returns {*}
 */
const createEditor = (html) => {
    const editor = Mocks.editorFactory();
    editor.setContent(html);
    editor.options.get = jest.fn().mockReturnValue([widget])
    return editor;
};

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
        editor = Mocks.editorFactory();
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
});