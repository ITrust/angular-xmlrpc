// Fix an IE problem (another one)
var HAS_ACTIVEX = false;
try {
    new ActiveXObject('MSXML2.DOMDocument');
    HAS_ACTIVEX = true;
} catch(e) {}

/**
 * XML-RPC communication service.
 */
angular.module('Dashboards.services')
.factory('xmlrpc', ['$http', 'helperXmlRpc', 'js2xml', 'xml2js', function($http, helperXmlRpc, js2xml, xml2js){
    var configuration = {};

    /**
     * Serialize a XML document to string.
     */
    function serialize(xml){
        var text = xml.xml;
        if (text) {
            return text;
        }
        if (typeof XMLSerializer != 'undefined') {
            return new XMLSerializer().serializeToString(xml);
        }
        throw Error('Your browser does not support serializing XML documents');
    };

    /**
     * Creates a xmlrpc call of the given method with given params.
     */
    function createCall(method, params){
        var doc = helperXmlRpc.createDocument('methodCall');
        doc.firstChild.appendChild(
            helperXmlRpc.createNode(doc, 'methodName', method)
        );
        if (arguments.length > 2) {
            params = helperXmlRpc.cloneArray(arguments);
            params.shift(); 
        }
        if (params && params.length > 0) {
            var paramsNode = helperXmlRpc.createNode(doc, 'params');
            for (var i=0; i < params.length; i++) {
                paramsNode.appendChild(helperXmlRpc.createNode(doc, 'param',
                    js2xml.js2xml(doc, params[i])
                ));
            }
            doc.firstChild.appendChild(paramsNode);
        }
        return (serialize(doc)).replace(/[\s\xa0]+$/, '');

    };

    // Use the promise system from angular.
    // This method return a promise with the response
    function callMethod(method, params){
        var xmlstr = createCall(method, params);
        var targetAddr = configuration.hostName + "" + configuration.pathName;
        return $http.post(targetAddr, xmlstr, {headers: {'Content-Type': 'text/xml'}})
            .then(function(responseFromServer) {
                var responseText = responseFromServer.data;
                var response = null;
                try {
                    response = parseResponse(responseText);
                } catch (err) {
                    response = err;
                }
                return response;
            }, function(responseFromServer){
                if(responseFromServer.status in configuration){
                    if(typeof configuration[responseFromServer.status] == "function"){
                        return configuration[responseFromServer.status].call();
                    }
                }
            });
    };


    /**
     * Parse an xmlrpc response and return the js object.
     */
    function parseResponse(response){
        var doc = helperXmlRpc.loadXml(response);
        var rootNode = doc.firstChild;
        if (!rootNode)
            return undefined;
        //else
        var node = helperXmlRpc.selectSingleNode(rootNode, '//fault');
        var isFault = (node != undefined);
        node = helperXmlRpc.selectSingleNode(rootNode, '//value');
        var value = xml2js.xml2js(node);
        if (isFault) {
            throw value;
        }
        //else
        return value;
    };

    /**
     * Configure the service (Host name and service path).
     * Actually, 401, 404 and 500 server errors are originally defined, but any error code can be added
     */
    function config(conf) {
        angular.extend(configuration, {
            hostName:"",
            pathName:"/rpc2",
            500:function(){},
            401:function(){},
            404:function(){}
        }, conf);
    };

    config();

    return {
        callMethod : callMethod,
        config : config
    };
}])


.factory('helperXmlRpc', function(){
    /**
     * Clones an array object
     */
    function cloneArray_(object){
        var length = object.length;

        if (length > 0) {
            var rv = new Array(length);
            for (var i = 0; i < length; i++) {
                rv[i] = object[i];
            }
            return rv;
        }
        return [];
    };
 
    /**
     * Creates a XML document for IEs browsers 
     */
    function createMsXmlDocument_(){
        var doc = new ActiveXObject('MSXML2.DOMDocument');
        if (doc) {
            doc.resolveExternals = false;
            doc.validateOnParse = false;
            try {
                doc.setProperty('ProhibitDTD', true);
                doc.setProperty('MaxXMLSize', 2 * 1024);
                doc.setProperty('MaxElementDepth', 256);
            } catch (e) {
                // No-op.
            }
        }
        return doc;
    };
    
    /**
     * Creates a XML document
     */
    function createDocument(opt_rootTagName, opt_namespaceUri){
        if (opt_namespaceUri && !opt_rootTagName) {
            throw Error("Can't create document with namespace and no root tag");
        }
        if (HAS_ACTIVEX) {
            var doc = createMsXmlDocument_();
            if (doc) {
                if (opt_rootTagName) {
                    doc.appendChild(doc.createNode(1,
                                       opt_rootTagName,
                                       opt_namespaceUri || ''));
                }
                return doc;
            }
        }
        else if (document.implementation && document.implementation.createDocument) {
            return document.implementation.createDocument(opt_namespaceUri || '',
                                                  opt_rootTagName || '',
                                                  null);
        } 
        throw Error('Your browser does not support creating new documents');
    };

    
    /**
     * Creates a XML node and set the child(ren) node(s)
     */
    function createNode(doc, nodeName, children){
        var elt = doc.createElement(nodeName);

        var appendChild = function(child) {
            if(typeof child == 'object' && child.nodeType !== 1){
                for(var i in child){
                    elt.appendChild(
                        (typeof child == 'string') ? doc.createTextNode(child[i]) : child[i]
                    );
                }
            } else {
                elt.appendChild(
                    (typeof child == 'string') ? doc.createTextNode(child) : child
                );
            }
        }
        if (arguments.length > 3) {
            children = cloneArray_(arguments);
            children.shift(); //shift doc
            children.shift(); //shift nodeName
        }
        if (typeof children == 'array') {
            angular.forEach(children, appendChild);
        } else if (children) {
            appendChild(children);
        }
        return elt;
    };

    /**
     * Generate an ID for XMLRPC request
     */
    function generateId(){
        return 'xmlrpc-'+(new Date().getTime())+'-'+Math.floor(Math.random()*1000);
    };
 
    /**
     * Creates an XML document from a string
     */
    function loadXml_(xml) {
        if (HAS_ACTIVEX) {
            var doc = createMsXmlDocument_();
            doc.loadXML(xml);
            return doc;
        }
        else if (typeof DOMParser != 'undefined') {
            return new DOMParser().parseFromString(xml, 'application/xml');
        }
        throw Error('Your browser does not support loading xml documents');
    };

    /**
     * Returns the document in which the node is.
     */
    function getOwnerDocument_(node) {
        return (
            node.nodeType == 9 ? node :
            node.ownerDocument || node.document);
    };
    
    /**
     * Return a single node with the given name in the given node
     */
    function selectSingleNode_(node, path) {
        if (typeof node.selectSingleNode != 'undefined') {
            var doc = getOwnerDocument_(node);
            if (typeof doc.setProperty != 'undefined') {
                doc.setProperty('SelectionLanguage', 'XPath');
            }
            return node.selectSingleNode(path);
        } else if (document.implementation.hasFeature('XPath', '3.0')) {
            var doc = getOwnerDocument_(node);
            var resolver = doc.createNSResolver(doc.documentElement);
            var result = doc.evaluate(path, node, resolver,
                XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            return result.singleNodeValue;
        }
        return null;
    };

    /**
     * Returns the string content of a node
     */
    function getTextContent_(node, buf, normalizedWhitespace){
        var PREDEFINED_TAG_VALUES_ = {'IMG': ' ', 'BR': '\n'};
        if (node.nodeName in ['SCRIPT', 'STYLE', 'HEAD', 'IFRAME', 'OBJECT']) {
            // ignore certain tags
        } else if (node.nodeType == 3) {
            if (normalizedWhitespace) {
                buf.push(String(node.nodeValue).replace(/(\r\n|\r|\n)/g, ''));
            } else {
                
                buf.push(node.nodeValue);
            }
        } else if (node.nodeName in PREDEFINED_TAG_VALUES_) {
            buf.push(PREDEFINED_TAG_VALUES_[node.nodeName]);
        } else {
            var child = node.firstChild;
            while (child) {
                getTextContent_(child, buf, normalizedWhitespace);
                child = child.nextSibling;
            }
        }
        return buf.join('');
    };

    /**
     * Returns all the nodes in a array that are inside the given node with the given path
     */
    function selectNodes_(node, path) {
        if (typeof node.selectNodes != 'undefined') {
            var doc = getOwnerDocument_(node);
            if (typeof doc.setProperty != 'undefined') {
                doc.setProperty('SelectionLanguage', 'XPath');
            }
            return node.selectNodes(path);
        } else if (document.implementation.hasFeature('XPath', '3.0')) {
            var doc = getOwnerDocument_(node);
            var resolver = doc.createNSResolver(doc.documentElement);
            var nodes = doc.evaluate(path, node, resolver,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            var results = [];
            var count = nodes.snapshotLength;
            for (var i = 0; i < count; i++) {
                results.push(nodes.snapshotItem(i));
            }
            return results;
        } else {
            return [];
        }
    };

    return {
        cloneArray:cloneArray_,
        createDocument: createDocument,
        createNode: createNode,
        generateId: generateId,
        loadXml: loadXml_,
        getOwnerDocument:getOwnerDocument_,
        selectNodes: selectNodes_,
        getTextContent : getTextContent_,
        selectSingleNode: selectSingleNode_
    };

});
