describe('angular-xmlrpc', function() {

    beforeEach(module('xml-rpc'));

    var $xml2js;
    var $helperXmlRpc;

    beforeEach(inject(function(xml2js, helperXmlRpc){
        $xml2js = xml2js;
        $helperXmlRpc = helperXmlRpc;
    }));

    describe('xml2js', function() {

        it('should convert <nil/> to null', function() {
            var xml = '<nil/>'
            var node = $helperXmlRpc.loadXml(xml);
            var result = $xml2js.xml2js(node);
            expect(result).toEqual(null);
        });

        it('should convert a <string> tag to a string', function() {
            var xml = '<string>This is a test</string>'
            var node = $helperXmlRpc.loadXml(xml);
            var result = $xml2js.xml2js(node);
            expect(result).toEqual('This is a test');
        });

        it('should convert a <int> tag to an integer', function() {
            var xml = '<int>64</int>'
            var node = $helperXmlRpc.loadXml(xml);
            var result = $xml2js.xml2js(node);
            expect(result).toEqual(64);
        })

        it('should convert a <i4> tag to an integer', function() {
            var xml = '<i4>128</i4>'
            var node = $helperXmlRpc.loadXml(xml);
            var result = $xml2js.xml2js(node);
            expect(result).toEqual(128);
        })

        it('should convert a tag <i8> to a number', function() {
            var xml = '<i8>256</i8>';
            var node = $helperXmlRpc.loadXml(xml);
            var number = $xml2js.xml2js(node);
            expect(number).toEqual(256);
        });

        it('should convert a <double> tag to a float', function() {
            var xml = '<double>3.1415</double>'
            var node = $helperXmlRpc.loadXml(xml);
            var result = $xml2js.xml2js(node);
            expect(result).toEqual(3.1415);
        })

        it('should convert a <boolean> tag to true', function() {
            var xml = '<boolean>1</boolean>'
            var node = $helperXmlRpc.loadXml(xml);
            var result = $xml2js.xml2js(node);
            expect(result).toEqual(true);
        })

        it('should convert a <boolean> tag to false', function() {
            var xml = '<boolean>0</boolean>'
            var node = $helperXmlRpc.loadXml(xml);
            var result = $xml2js.xml2js(node);
            expect(result).toEqual(false);
        })

        it('should convert a <struct> tag to an object literal', function() {
            var xml = `
                <struct>
                    <member>
                        <name>number</name><value><int>42</int></value>
                    </member>
                    <member>
                        <name>string</name><value><string>hello</string></value>
                    </member>
                    <member>
                        <name>boolean</name><value><boolean>1</boolean></value>
                    </member>
                </struct>
            `;
            var node = $helperXmlRpc.loadXml(xml);
            var result = $xml2js.xml2js(node);
            expect(result).toEqual({
                number: 42,
                string: 'hello',
                boolean: true
            });
        })

        it('should convert a <array> tag to an array', function() {
            var xml = `
                <array>
                    <data>
                        <value><string>This</string></value>
                        <value><string>is</string></value>
                        <value><string>a</string></value>
                        <value><string>test</string></value>
                    </data>
                </array>
            `;
            var node = $helperXmlRpc.loadXml(xml);
            var result = $xml2js.xml2js(node);
            expect(result).toEqual(['This', 'is', 'a', 'test']);
        })

        it('should convert a <array> tag to an array of different types', function() {
            var xml = `
                <array>
                    <data>
                        <value><boolean>1</boolean></value>
                        <value><boolean>0</boolean></value>
                        <value><int>42</int></value>
                        <value><double>3.14</double></value>
                        <value><nil/></value>
                    </data>
                </array>
            `;
            var node = $helperXmlRpc.loadXml(xml);
            var result = $xml2js.xml2js(node);
            expect(result).toEqual([true, false, 42, 3.14, null]);
        });

        it('should convert a <dateTime.iso8601> tag to a date object', function() {
            var xml = '<dateTime.iso8601>19991231T23:59:59</dateTime.iso8601>'
            var node = $helperXmlRpc.loadXml(xml);
            var result = $xml2js.xml2js(node);
            expect(result).toEqual(new Date(1999, 11, 31, 23, 59, 59));
        })

        it('should convert a <dateTime> tag to a date object', function() {
            var xml = '<dateTime>19991231T23:59:59</dateTime>'
            var node = $helperXmlRpc.loadXml(xml);
            var result = $xml2js.xml2js(node);
            expect(result).toEqual(new Date(1999, 11, 31, 23, 59, 59));
        })

        
        it('should convert a <base64> tag to a string value', function() {
            var xml = '<base64>VGhpcyBpcyBhIHRlc3Q=</base64>'
            var node = $helperXmlRpc.loadXml(xml);
            var result = $xml2js.xml2js(node);
            expect(result).toEqual("VGhpcyBpcyBhIHRlc3Q=");
        })

    });
});
