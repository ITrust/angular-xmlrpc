"use strict";
const helpers_1 = require("../helpers");
function createJSConverter() {
    const helper = helpers_1.createHelper();
    function xml2null() {
        return null;
    }
    function xml2string(helper, input) {
        let buf = [];
        helper.getTextContent(input, buf, false);
        return buf.join('');
    }
    function xml2number(helper, input) {
        return parseFloat(helper.getTextContent(input, []));
    }
    function xml2boolean(helper, input) {
        const value = helper.getTextContent(input, []).toLowerCase();
        return value === '1' || value === 'true' || false;
    }
    function xml2struct(helper, input) {
        const memberNodes = helper.selectNodes(input, 'member') || [];
        let obj = {};
        memberNodes.forEach(e => {
            let node = helper.selectSingleNode(e, 'name');
            // If no name found, member is ignored
            if (node) {
                const label = helper.getTextContent(node, []);
                node = helper.selectSingleNode(e, 'value');
                obj[label] = xml2js(helper, node);
            }
        });
        return obj;
    }
    function xml2array(helper, input) {
        let valueNodes = helper.selectNodes(input, 'data/value');
        if (!valueNodes.length) {
            valueNodes = helper.selectNodes(input, './value');
        }
        if (!valueNodes.length)
            return [];
        return valueNodes.map(e => xml2js(helper, e));
    }
    function xml2datetime(helper, input) {
        let value = helper.getTextContent(input, []);
        if (!value) {
            return new Date();
        }
        if (value[value.length - 1] === 'T') {
            value = value.substring(0, value.length - 1);
        }
        const parts = value.match(/\d+/g);
        if (value.indexOf('-') === -1) {
            let toSplit = parts[0];
            parts[0] = toSplit.substring(0, 4);
            parts.splice(1, 0, toSplit.substring(4, 6));
            parts.splice(2, 0, toSplit.substring(6));
        }
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), parseInt(parts[3]), parseInt(parts[4]), parseInt(parts[5]));
    }
    function getMethod(p) {
        switch (p) {
            case 'nil': return xml2null;
            case 'string': return xml2string;
            case 'base64': return xml2string;
            case 'int': return xml2number;
            case 'i8': return xml2number;
            case 'i4': return xml2number;
            case 'double': return xml2number;
            case 'boolean': return xml2boolean;
            case 'struct': return xml2struct;
            case 'array': return xml2array;
            case 'datetime': return xml2datetime;
            case 'datetime.iso8601': return xml2datetime;
            default: return xml2struct;
        }
    }
    function xml2js(helper, input) {
        const elt = helper.selectSingleNode(input, './*');
        if (!elt)
            return null;
        // else
        const method = getMethod(elt.nodeName.toLowerCase());
        return method(helper, elt);
    }
    return {
        xml2js(input) {
            return xml2js(helper, input);
        }
    };
}
exports.createJSConverter = createJSConverter;
