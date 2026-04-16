/* eslint-disable no-console */
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Tiny WidgetHub plugin.
 *
 * @module      tiny_ibwidgethub/plugin
 * @copyright   2024 Josep Mulet Pol <pep.mulet@gmail.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import {subscribe} from "../extension";
import {getGlobalConfig} from "../options";
import {bs5Refractor} from "./refractorbs5";
import Common from '../common';
import * as coreStr from "core/str";

export const prefix = 'f';

/**
 * If the same id is detected, then a new one is generated.
 * @param {string} oldId
 * @param {Set<string>} usedIds
 */
function normalizeId(oldId, usedIds) {
    let newId = oldId;
    let version = 1;
    while (usedIds.has(newId)) {
        newId = `${oldId}v${version}`;
        version++;
    }
    usedIds.add(newId);
    return newId;
}

/**
 * @param {Element} elem
 * @param {string} name
 * @param {string} value
 */
function setAttributeIfSet(elem, name, value) {
    if (elem.getAttribute(name)) {
        elem.setAttribute(name, value);
    }
}

/**
 * @param {import("../plugin").TinyMCE} editor
 * @returns {boolean}
 */
export function idFixingRefractor(editor) {
    const body = editor.getBody();
    /** @type {Set<string>} */
    const usedIds = new Set();
    let changes = 0;

    // Treat accordions
    body.querySelectorAll('div.accordion.iedib-accordion').forEach((/** @type {Element}*/ elem) => {
        try {
            const oldId = elem.id ?? 'id';
            let newId = oldId;
            if (RegExp(/^\d/).exec(oldId)) {
                newId = prefix + oldId;
            }
            // Search for repeated id's
            newId = normalizeId(newId, usedIds);
            if (newId === oldId) {
                return;
            }
            elem.id = newId;
            changes++;
            // Rename on all toogles
            const allAs = elem
                .querySelectorAll('a.accordion-toggle[data-toggle="collapse"],a.accordion-toggle[data-bs-toggle="collapse"]');
            allAs.forEach((asel, i) => {
                asel.setAttribute('href', `#collapse_${newId}_${i + 1}`);
                setAttributeIfSet(asel, "data-parent", '#' + newId);
                setAttributeIfSet(asel, "data-bs-parent", '#' + newId);
            });
            // Rename on all toggles
            elem.querySelectorAll('div.accordion-body.collapse').forEach((acol, i) => {
                acol.id = `collapse_${newId}_${i + 1}`;
                setAttributeIfSet(acol, "data-parent", '#' + newId);
                setAttributeIfSet(acol, "data-bs-parent", '#' + newId);
            });
        } catch (ex) {
            console.error('Error fixing accordions:', ex);
        }
    });


    // Fix tabpanes
    body.querySelectorAll('div.tab-pane.iedib-tabpane').forEach((/** @type {Element}*/ elem) => {
        try {
            const oldId = elem.id;
            let newId = oldId;
            if (RegExp(/^\d/).exec(oldId)) {
                newId = prefix + oldId;
            }
            // Search for repeated id's
            newId = normalizeId(newId, usedIds);
            if (newId === oldId) {
                return;
            }
            changes++;
            // Fix body id
            elem.id = newId;
            // Fix the corresponding tab reference
            const rootElem = elem.closest('div.tabbable');
            if (rootElem) {
                const anchor = rootElem.querySelector(`a[href="#${oldId}"]`);
                anchor?.setAttribute('href', `#${newId}`);
            }
        } catch (ex) {
            console.error('Error fixing tabpanes:', ex);
        }
    });

    // Do not remove tabmenu items that are not a visited "id". Fix, however, its id if required.
    body.querySelectorAll('ul.nav.nav-tabs > li > a').forEach((/** @type {Element}*/ elem) => {
        const oldId = elem.getAttribute('href')?.replace('#', '')?.trim();
        if (!oldId) {
            return;
        }
        let newId = oldId;
        if (RegExp(/^\d/).exec(oldId)) {
            newId = prefix + oldId;
        }
        if (newId === oldId) {
            return;
        }
        elem.setAttribute('href', `#${newId}`);
    });

    return changes > 0;
}

/**
 * @param {import("../plugin").TinyMCE} editor
 */
export async function refractoring(editor) {
    let changes = false;
    if (getGlobalConfig(editor, 'oninit.refractor.ids', '1') === '1') {
        changes = idFixingRefractor(editor);
    }
    if (getGlobalConfig(editor, 'oninit.refractor.bs5', '0') === '1') {
        changes = changes || bs5Refractor(editor);
    }
    if (changes) {
        const saverequired = await coreStr.get_string('saverequired', Common.component);
        editor.notificationManager.open({
            text: saverequired,
            type: 'warning',
            timeout: 4000
        });
        editor.setDirty(true);
    }
}

subscribe('contentSet', refractoring);