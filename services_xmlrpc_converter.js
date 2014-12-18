/**
 * Service providing a converter between XML and JS.
 * Useful to communicate with XML-RPC.
 */
angular.module('Dashboards.services')
.factory('js2xml', ['helperXmlRpc', function(helperXmlRpc){
    /**
     * Convert Null to XmlRpc valid value (as xml element)
     */
    function null2xml_(doc, input) {
        return helperXmlRpc.createNode(doc, 'nil');
    };

    var js2xmlMethod_ = {};

    /**
     * Convert a string to a valid xmlrpc value (as xml element).
     */
    function string2xml_(doc, input) {
        return helperXmlRpc.createNode(doc, 'string', input);
    };
    js2xmlMethod_['string'] = string2xml_;

    /**
     * Convert a number to a valid xmlrpc value (as xml element).
     */
    function number2xml_(doc, input) {
        var type  = 'int',
            value = parseInt(input),
            f     = parseFloat(input);
        if (value != f) {
            type  = 'double';
            value = f;
        }
        return helperXmlRpc.createNode(doc, type, value.toString());
    };
    js2xmlMethod_['number'] = number2xml_;

    
    /**
     * Convert a boolean to a valid xmlrpc value (as xml element).
     */
    function boolean2xml_(doc, input) {
        return helperXmlRpc.createNode(doc, 'boolean', (input ? '1' : '0'));
    };
    js2xmlMethod_['boolean'] = boolean2xml_;

     


    /**
     * Convert an Array object to a valid xmlrpc value (as xml element).
     */
    function array2xml_(doc, input) {
        var elements = [];
        for (var i=0; i < input.length; i++) {
            elements.push(js2xml_(doc, input[i]));
        }
        return helperXmlRpc.createNode(doc, 'array',
            helperXmlRpc.createNode(doc, 'data', elements)
        );
    };

    /**
     * Convert an object to a valid xmlrpc value (as xml element).
     */
    function struct2xml_(doc, input) {
        var elements = [];
        for (var name in input) {
            elements.push(helperXmlRpc.createNode(doc, 'member',
                helperXmlRpc.createNode(doc, 'name', name),
                js2xml_(doc, input[name])
            ));
        }
        return helperXmlRpc.createNode(doc, 'struct', elements);
    };


    /**
     * Convert a DateTime object to a valid xmlrpc value (as xml element).
     */
    function date2xml_(doc, input) {
        var str = [
            input.getFullYear(),
            (input.getMonth() + 1 < 10)? '0' + (input.getMonth() + 1):input.getMonth() + 1,
            (input.getDate() < 10)? '0' + (input.getDate()):input.getDate(),
            'T',
            (input.getHours() < 10)? '0' + (input.getHours()):input.getHours(), ':',
            (input.getMinutes() < 10)? '0' + (input.getMinutes()):input.getMinutes(), ':',
            (input.getSeconds() < 10)? '0' + (input.getSeconds()):input.getSeconds(),
        ];

        return helperXmlRpc.createNode(doc, 'dateTime.iso8601', str.join(''));
    };

    /**
     * Convert an object to a valid xmlrpc value (as xml element).
     */
    function object2xml_(doc, input) {
        if (input instanceof Date) {
            return date2xml_(doc, input);
        }
        //else
        if (input instanceof Array)
            return array2xml_(doc, input);
        //else
        return struct2xml_(doc, input);
    };
    js2xmlMethod_['object'] = object2xml_;


    /**
     * Converts a javascript object to a valid xmlrpc value (as xml element).
     */
    function js2xml_(doc, input) {
        var type = typeof(input);
        var method = js2xmlMethod_[type];
        if (input === null) {
            method = null2xml_;
        } else if (method == undefined) {
            method = string2xml_;
        }
        return helperXmlRpc.createNode(doc, 'value', method(doc, input));
    };

    return {
        js2xml:js2xml_
    };
}])

.factory('xml2js', ['helperXmlRpc', function(helperXmlRpc){

    var isTrue_ = {
        '1':    true,
        'true': true
    };

    var xml2jsMethod_ = {};

    /**
     * Convert an xmlrpc string value (as an xml tree) to a javascript string.
     */
    function xml2null_(input) {
        return null;
    };
    xml2jsMethod_['nil'] = xml2null_;

    
    /**
     * Convert an xmlrpc string value (as an xml tree) to a javascript string.
     *
     * @param {!Element} input Xmlrpc string to convert.
     * @return {string} Javascript conversion of input.
     * @protected
     */
    function xml2string_(input) {
        var buf = [];
        helperXmlRpc.getTextContent(input, buf, false);
        return buf.join('');
    };
    xml2jsMethod_['string'] = xml2string_;

    /**
     * Convert an xmlrpc number (int or double) value to a javascript number.
     */
    function xml2number_(input) {
        return parseFloat(helperXmlRpc.getTextContent(input, []));
    };
    xml2jsMethod_['int'] = xml2number_;
    xml2jsMethod_['i4'] = xml2number_;
    xml2jsMethod_['double'] = xml2number_;

     
    /**
     * Convert an xmlrpc boolean value to a javascript boolean.
     */
    function xml2boolean_(input) {
        var value = helperXmlRpc.getTextContent(input, []).toLowerCase();
        return isTrue_[value] || false;
    };
    xml2jsMethod_['boolean'] = xml2boolean_;

    /**
     * Convert an xmlrpc struct value to a javascript object.
     */
    function xml2struct_(input) {
        var memberNodes = helperXmlRpc.selectNodes(input, 'member') || [];
        var obj = {};
        for (var i=0; i < memberNodes.length; i++) {
            var node = helperXmlRpc.selectSingleNode(memberNodes[i], 'name');
            // If no name found, member is ignored
            if (node) {
                var label = helperXmlRpc.getTextContent(node, []);
                node = helperXmlRpc.selectSingleNode(memberNodes[i], 'value');
                obj[label] = xml2js_(node);
            }
        }
        return obj;
    };
    xml2jsMethod_['struct'] = xml2struct_;

    /**
     * Convert an xmlrpc array value to a javascript array.
     */
    function xml2array_(input) {
        var valueNodes = helperXmlRpc.selectNodes(input, 'data/value');
        if (!valueNodes.length) {
            valueNodes = helperXmlRpc.selectNodes(input, './value');
        }
        if (!valueNodes.length)
            return [];
        //else
        var map_ = (Array.prototype.map) ?
            function(arr, f, opt_obj) {
                return Array.prototype.map.call(arr, f, opt_obj);
            } :
            function(arr, f, opt_obj) {
                var l = arr.length;  // must be fixed during loop... see docs
                var res = new Array(l);
                var arr2 = (typeof arr == 'string') ? arr.split('') : arr;
                for (var i = 0; i < l; i++) {
                    if (i in arr2) {
                        res[i] = f.call(opt_obj, arr2[i], i, arr);
                    }
                }
                return res;
            };        

        return map_(valueNodes, xml2js_);
    };
    xml2jsMethod_['array'] = xml2array_;

    /**
     * Convert an xmlrpc dateTime value to an itrust.date.DateTime.
     */
    function xml2datetime_(input) {
        var value = helperXmlRpc.getTextContent(input, []);
        if (!value) {
            return new Date();
        }
        if (value[value.length-1]=='T') {
            value = value.substring(0, value.length-1);
        }
        var parts = value.match(/\d+/g);
        if(value.indexOf('-') == -1){
            var toSplit = parts[0];
            parts[0] = toSplit.substring(0,4);
            parts.splice(1, 0, toSplit.substring(4,6));
            parts.splice(2, 0, toSplit.substring(6));
        }
        return new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
    };
    xml2jsMethod_['datetime'] = xml2datetime_;
    xml2jsMethod_['datetime.iso8601'] = xml2datetime_;

    

    /**
     * Convert an xmlrpc value (as an xml tree) to a javascript object.
     */
    function xml2js_(input) {
        var elt = helperXmlRpc.selectSingleNode(input, './*');
        if (!elt)
            return null;
        //else
        var method = xml2jsMethod_[elt.nodeName.toLowerCase()];
        if (method == undefined) {
            method = xml2struct_;
        }
        return method(elt);
    };

    return {
        xml2js:xml2js_,
    };
}]);
