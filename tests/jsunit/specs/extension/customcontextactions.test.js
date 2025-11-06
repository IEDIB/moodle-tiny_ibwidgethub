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
    const editor = Mocks.editorFactory();
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