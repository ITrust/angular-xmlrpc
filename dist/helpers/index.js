"use strict";
function createHelper() {
    const getType = p => Object.prototype.toString.call(p).slice(8, -1).toLowerCase();
    return {
        cloneArray(arr) {
            return arr.slice(0);
        },
        createDocument(rootTagName, namespaceUri) {
            if (namespaceUri && !rootTagName) {
                throw Error('Can\'t create document with namespace and no root tag');
            }
            if (HAS_ACTIVE_X()) {
                const doc = createMsXmlDocument();
                if (doc) {
                    if (rootTagName) {
                        doc.appendChild(doc.createNode(1, rootTagName, namespaceUri || ''));
                    }
                    return doc;
                }
            }
            else if (document.implementation && document.implementation.createDocument) {
                return document.implementation.createDocument(namespaceUri || '', rootTagName || '', null);
            }
            throw Error('Your browser does not support creating new documents');
        },
        createNode(doc, nodeName, children) {
            const elt = doc.createElement(nodeName);
            const appendChild = child => {
                if (getType(child) === 'object' && child.nodeType !== 1) {
                    child.forEach(e => {
                        elt.appendChild((typeof e === 'string') ? doc.createTextNode(e) : e);
                    });
                }
                else {
                    elt.appendChild((typeof child === 'string') ? doc.createTextNode(child) : child);
                }
            };
            if (Array.isArray(children)) {
                children.forEach(appendChild);
            }
            else if (children) {
                appendChild(children);
            }
            return elt;
        },
        generateId() {
            return `xmlrpc-${new Date().getTime()}-${Math.floor(Math.random() * 1000)}`;
        },
        loadXml(xml) {
            if (HAS_ACTIVE_X()) {
                const doc = createMsXmlDocument();
                doc.loadXML(xml);
                return doc;
            }
            else if (typeof DOMParser !== 'undefined') {
                return new DOMParser().parseFromString(xml, 'application/xml');
            }
            throw Error('Your browser does not support loading xml documents');
        },
        getOwnerDocument,
        selectNodes(node, path) {
            const doc = getOwnerDocument(node);
            if (typeof node.selectNodes !== 'undefined') {
                if (typeof doc.setProperty !== 'undefined') {
                    doc.setProperty('SelectionLanguage', 'XPath');
                }
                return node.selectNodes(path);
            }
            else if (document.implementation.hasFeature('XPath', '3.0')) {
                const resolver = doc.createNSResolver(doc.documentElement), nodes = doc.evaluate(path, node, resolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null), results = [], count = nodes.snapshotLength;
                for (let i = 0; i < count; i++) {
                    results.push(nodes.snapshotItem(i));
                }
                return results;
            }
            else {
                return [];
            }
        },
        getTextContent,
        selectSingleNode(node, path) {
            const doc = getOwnerDocument(node);
            if (typeof node.selectSingleNode !== 'undefined') {
                if (typeof doc.setProperty !== 'undefined') {
                    doc.setProperty('SelectionLanguage', 'XPath');
                }
                return node.selectSingleNode(path);
            }
            else if (document.implementation.hasFeature('XPath', '3.0')) {
                const resolver = doc.createNSResolver(doc.documentElement), result = doc.evaluate(path, node, resolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                return result.singleNodeValue;
            }
            return null;
        }
    };
}
exports.createHelper = createHelper;
function getOwnerDocument(node) {
    return (node.nodeType === 9 ? node :
        node.ownerDocument || node.document);
}
function getTextContent(node, buf, normalizedWhitespace) {
    const PREDEFINED_TAG_VALUES_ = { 'IMG': ' ', 'BR': '\n' };
    if (node.nodeName in ['SCRIPT', 'STYLE', 'HEAD', 'IFRAME', 'OBJECT']) {
    }
    else if (node.nodeType === 3) {
        if (normalizedWhitespace) {
            buf.push(String(node.nodeValue).replace(/(\r\n|\r|\n)/g, ''));
        }
        else {
            buf.push(node.nodeValue);
        }
    }
    else if (node.nodeName in PREDEFINED_TAG_VALUES_) {
        buf.push(PREDEFINED_TAG_VALUES_[node.nodeName]);
    }
    else {
        let child = node.firstChild;
        while (child) {
            getTextContent(child, buf, normalizedWhitespace);
            child = child.nextSibling;
        }
    }
    return buf.join('');
}
function createMsXmlDocument() {
    const doc = new ActiveXObject('MSXML2.DOMDocument');
    if (doc) {
        doc.resolveExternals = false;
        doc.validateOnParse = false;
        try {
            doc.setProperty('ProhibitDTD', true);
            doc.setProperty('MaxXMLSize', 2 * 1024);
            doc.setProperty('MaxElementDepth', 256);
        }
        catch (e) {
        }
    }
    return doc;
}
function HAS_ACTIVE_X() {
    try {
        new ActiveXObject('MSXML2.DOMDocument');
        return true;
    }
    catch (e) {
        return false;
    }
}
