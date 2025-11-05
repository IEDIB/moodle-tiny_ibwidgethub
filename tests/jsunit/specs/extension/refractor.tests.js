const refractor = require('../../src/extension/refractor');

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

describe('refractor', () => {

    
});