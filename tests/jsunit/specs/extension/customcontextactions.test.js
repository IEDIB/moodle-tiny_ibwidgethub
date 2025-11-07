const actions = require('../../src/extension/customcontextactions');

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
    const editor = global.Mocks.editorFactory();
    editor.setContent(html);
    editor.options.get = jest.fn().mockReturnValue([widget])
    return editor;
};

describe('contextactions', () => {

    it('addImageEffectAction includes zoom effect', () => {
        const editor = createEditor(`
        <div class="iedib-img" data-snptd="zoom">
            <img src="https://server.com/sample.png"/>
        </div>    
        `);
        /** @type {HTMLElement} */
        const selectedElement = editor.getBody().querySelector('img');
        /** @type {HTMLElement} */
        const elem = editor.getBody().querySelector('.iedib-img');
        /** @type {{ctx: import("../../src/contextactions").ItemMenuContext, type: string}} */
        const self = {
            ctx: {
                editor,
                path: {
                    selectedElement: selectedElement,
                    elem: elem,
                    targetElement: undefined,
                    /** @type {*} */
                    widget
                },
                actionPaths: {}
            },
            type: 'zoom'
        };

        actions.addImageEffectAction.call(self);
        expect(editor.getBody().querySelector('.iedib-img').dataset.snptd).toEqual('zoom');
        expect(editor.getBody().querySelector('.iedib-sd-area')).toBeTruthy();
        expect(editor.getBody().querySelectorAll('.iedib-sd-area script[src*="images.min.js"]')).toHaveLength(1);
    });

    it('changeBoxLangAction', () => {
        const editor = createEditor(`
        <div class="iedib-capsa-important" data-lang="ca">
             <div class="iedib-central">
                <div class="iedib-titolLateral">
                    <span>IMPORTANT</span>
                </div>
             </div>
        </div>    
        `);
        /** @type {HTMLElement} */
        const selectedElement = editor.getBody().querySelector('.iedib-central');
        /** @type {HTMLElement} */
        const elem = editor.getBody().querySelector('.iedib-capsa-important');
        /** @type {{ctx: import("../../src/contextactions").ItemMenuContext, iso: string}} */
        const self = {
            ctx: {
                editor,
                path: {
                    selectedElement,
                    elem: elem,
                    targetElement: undefined,
                    /** @type {*} */
                    widget: {
                        I18n: {
                            msg: {
                                ca: 'IMPORTANT',
                                en: 'LOOK OUT!'
                            } 
                        }
                    }
                }, 
                actionPaths: {}
            },
            iso: 'en'
        };

        actions.changeBoxLangAction.call(self);

        expect(elem.dataset.lang).toEqual('en');
        expect(elem.querySelector('.iedib-titolLateral')?.textContent).toBe('LOOK OUT!'); 
    });

});


describe('contextactions additional tests', () => {

    it('removeImageEffectsAction removes data-snptd and role', () => {
        const editor = createEditor(`<div class="iedib-img" data-snptd="zoom" role="snptd_image"></div>`);
        const elem = editor.getBody().querySelector('.iedib-img');

        /** @type {*} */
        const self = { ctx: { editor, path: { elem } } };
        actions.removeImageEffectsAction.call(self);

        expect(elem.hasAttribute('data-snptd')).toBe(false);
        expect(elem.hasAttribute('role')).toBe(false);
    });

    it('changeBoxSizeAction sets the correct class', () => {
        const editor = createEditor(`<div class="iedib-capsa iedib-capsa-mitjana"></div>`);
        const elem = editor.getBody().querySelector('.iedib-capsa');
        /** @type {*} */
        const self = { ctx: { path: { elem, widget: {} } }, size: 'gran' };
        actions.changeBoxSizeAction.call(self);

        expect(elem.classList.contains('iedib-capsa-gran')).toBe(true);
        expect(elem.classList.contains('iedib-capsa-mitjana')).toBe(false);
    });

    it('changeBoxSeverityAction updates border and lateral classes', () => {
        const html = `<div class="iedib-capsa iedib-alerta-border" data-lang="ca">
            <div class="iedib-lateral iedib-alerta">
                <div class="iedib-titolLateral">Alert!</div>
            </div>
        </div>`;
        const editor = createEditor(html);
        const elem = editor.getBody().querySelector('.iedib-capsa');

        const widget = { I18n: { msg_alerta: { ca: 'Alerta!', en: 'Warning!' } } };
         /** @type {*} */
        const self = { ctx: { path: { elem, widget } }, severity: 'important' };

        actions.changeBoxSeverityAction.call(self);

        expect(elem.classList.contains('iedib-important-border')).toBe(true);
        const lateral = elem.querySelector('.iedib-lateral');
        expect(lateral.classList.contains('iedib-important')).toBe(true);
    });

    it('switchBoxSimpleExampleAction replaces target with new snippet', () => {
        const editor = createEditor(`
        <p><br></p>
        <div class="iedib-capsa iedib-capsa-gran iedib-exemple-border" data-lang="ca">
        <!--begin: Capsa exemple 2 files -->
        <div class="iedib-lateral iedib-exemple">
        <p class="iedib-titolLateral">Exemple<span class="iedib-exemple-logo"></span></p>
        </div>
        <div class="iedib-formulacio-rows">
            <p>Escriviu en aquesta secció l'enunciat del problema.</p>
        </div>
        <div class="iedib-resolucio-rows">
        <p>Escriviu en aquesta altra secció la resolució del problema.</p>
        </div>
        <!--end: Capsa exemple 2 files--> 
        </div>
        <p><br></p>
        `);
        const elem = editor.getBody().querySelector('.iedib-capsa');
         /** @type {*} */
        const self = { ctx: { editor, path: { elem, widget: {} } } };
        actions.switchBoxSimpleExampleAction.call(self);

        const newElem = editor.getBody().querySelector('.iedib-exemple-border');
        console.log(editor.getBody().innerHTML);
        expect(newElem).toBeTruthy();
        expect(newElem.querySelector('.iedib-central')).toBeTruthy();
        expect(newElem.querySelector('.iedib-central').innerHTML).toContain('enunciat del problema');
        expect(newElem.querySelector('.iedib-central').innerHTML).toContain('resolució del problema');
        expect(newElem.querySelector('.iedib-formulacio-rows')).toBeFalsy();
        expect(newElem.querySelector('.iedib-resolucio-rows')).toBeFalsy();
        
    });

    it('imageSwitchToSnippetAction wraps target in figure', () => {
        const editor = createEditor(`<img src="img.png" />`);
        const target = editor.getBody().querySelector('img');
         /** @type {*} */
        const self = { ctx: { editor, path: { targetElement: target } } };
        actions.imageSwitchToSnippetAction.call(self);

        const figure = editor.getBody().querySelector('.iedib-figura');
        expect(figure).toBeTruthy();
        expect(figure.querySelector('img')).toBeTruthy();
    });

    it('changeColumnWidth splits columns correctly for valid colSpan', () => {
        const editor = createEditor(`<div><div></div><div></div></div>`);
        const elem = editor.getBody().querySelector('div');
         /** @type {*} */
        const self = { ctx: { path: { elem } }, colSpan: 4 };
        actions.changeColumnWidth.call(self);

        const first = elem.querySelector('div:first-child');
        const last = elem.querySelector('div:last-child');
        expect(first.className).toBe('span4');
        expect(last.className).toBe('span8');
    });

    it('setAccordionBehavior sets and removes data-parent based on isDependentBehavior', () => {
        const html = `<div id="accordion"><div class="accordion-body"></div></div>`;
        const editor = createEditor(html);
        const elem = editor.getBody().querySelector('#accordion');
         /** @type {*} */
        let self = { ctx: { path: { elem } }, isDependentBehavior: false };
        actions.setAccordionBehavior.call(self);

        const acc = elem.querySelector('.accordion-body');
        expect(acc.getAttribute('data-parent')).toBe('#accordion');

        self = { ctx: { path: { elem } }, isDependentBehavior: true };
        actions.setAccordionBehavior.call(self);
        expect(acc.hasAttribute('data-parent')).toBe(false);
    });

    it('convert2BootstrapTable adds correct classes and removes styles', () => {
        const html = `<table class="iedib-table" style="color:red;"><thead><tr><th style="color:blue">H</th></tr></thead><tr><td style="color:green">D</td></tr></table>`;
        const editor = createEditor(html);
        const elem = editor.getBody().querySelector('table');
         /** @type {*} */
        const self = { ctx: { path: { elem } } };
        actions.convert2BootstrapTable.call(self);

        expect(elem.classList.contains('iedib-table')).toBe(false);
        expect(elem.classList.contains('table')).toBe(true);
        expect(elem.classList.contains('table-striped')).toBe(true);
        expect(elem.classList.contains('iedib-bstable')).toBe(true);
        expect(elem.getAttribute('style')).toBe(null);
        expect(elem.querySelector('td').getAttribute('style')).toBe(null);
        expect(elem.querySelector('th').getAttribute('role')).toBe('col');
    });

    it('toggleTableHeader adds and removes THEAD correctly', () => {
        const html = `<table><tr><td>1</td></tr></table>`;
        const editor = createEditor(html);
        const elem = editor.getBody().querySelector('table');
         /** @type {*} */
        const self = { ctx: { path: { elem }, editor } };
        actions.toggleTableHeader.call(self);

        expect(elem.querySelector('thead')).toBeTruthy();

        // Call again to remove
        actions.toggleTableHeader.call(self);
        expect(elem.querySelector('thead')).toBe(null);
    });

});
