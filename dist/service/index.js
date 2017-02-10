"use strict";
const js2xml_1 = require("../converters/js2xml");
const xml2js_1 = require("../converters/xml2js");
const helpers_1 = require("../helpers");
class XmlRpcServiceAbstract {
    constructor() {
        this.helper = helpers_1.createHelper();
        this.jsConverter = xml2js_1.createJSConverter();
        this.xmlConverter = js2xml_1.createXMLConverter();
        this.configuration = {};
    }
    serialize(xml) {
        const text = xml.xml;
        if (text) {
            return text;
        }
        if (typeof XMLSerializer !== 'undefined') {
            return new XMLSerializer().serializeToString(xml);
        }
        throw Error('Your browser does not support serializing XML documents');
    }
    parseResponse(response) {
        const doc = this.helper.loadXml(response);
        const rootNode = doc.firstChild;
        if (!rootNode)
            return undefined;
        // else
        let node = this.helper.selectSingleNode(rootNode, '//fault');
        const isFault = (node !== undefined);
        node = this.helper.selectSingleNode(rootNode, '//value');
        const value = this.jsConverter.xml2js(node);
        if (isFault) {
            throw value;
        }
        // else
        return value;
    }
    createCall(method, params) {
        const doc = this.helper.createDocument('methodCall');
        doc.firstChild.appendChild(this.helper.createNode(doc, 'methodName', method));
        if (params && params.length > 0) {
            const paramsNode = this.helper.createNode(doc, 'params');
            params.forEach(e => {
                paramsNode.appendChild(this.helper.createNode(doc, 'param', this.xmlConverter.js2xml(doc, e)));
            });
            doc.firstChild.appendChild(paramsNode);
        }
        return (this.serialize(doc)).replace(/[\s\xa0]+$/, '');
    }
    callMethodImpl(url, xmlParams) {
        console.log('To be implemented');
    }
    config(conf) {
        this.configuration = Object.assign({}, {
            hostName: '',
            pathName: '/rpc2',
            500: function () { },
            401: function () { },
            404: function () { }
        }, conf);
        return true;
    }
    callMethod(method, params) {
        const xmlstr = this.createCall(method, params);
        const targetAddr = `${this.configuration['hostName']}${this.configuration['pathName']}`;
        return this.callMethodImpl(targetAddr, xmlstr);
    }
}
exports.XmlRpcServiceAbstract = XmlRpcServiceAbstract;
