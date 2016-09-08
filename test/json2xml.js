describe('angular-xmlrpc', function() {

    beforeEach(module('xml-rpc'));

    var $js2xml;
    var $helperXmlRpc;
    var $doc;

    beforeEach(inject(function(js2xml, helperXmlRpc) {
        $js2xml = js2xml;
        $helperXmlRpc = helperXmlRpc;
        $doc = $helperXmlRpc.createDocument('test');
    }));

    describe('js2xml', function() {

        it('should convert null to </nil> xml tag', function() {
            var xml = $js2xml.js2xml($doc, null);
            expect(xml.innerHTML).toEqual('<nil/>');
        })

        it('should convert string to </string> xml tag', function() {
            var xml = $js2xml.js2xml($doc, 'A string test');
            expect(xml.innerHTML).toEqual('<string>A string test</string>');
        })

        it('should convert a integer to </int> xml tag', function() {
            var xml = $js2xml.js2xml($doc, 64);
            expect(xml.innerHTML).toEqual('<int>64</int>');
        })

        it('should convert a double to </double> xml tag', function() {
            var xml = $js2xml.js2xml($doc, 3.14159265359);
            expect(xml.innerHTML).toEqual('<double>3.14159265359</double>');
        })

        it('should convert true to </boolean> xml tag', function() {
            var xml = $js2xml.js2xml($doc, true);
            expect(xml.innerHTML).toEqual('<boolean>1</boolean>');
        })

        it('should convert false to </boolean> xml tag', function() {
            var xml = $js2xml.js2xml($doc, false);
            expect(xml.innerHTML).toEqual('<boolean>0</boolean>');
        })

        it('should convert an array of strings to an </array> xml tag', function() {
            var xml = $js2xml.js2xml($doc, ["This", "is", "a", "test"]);

            var output = `
                <array>
                    <data>
                        <value><string>This</string></value>
                        <value><string>is</string></value>
                        <value><string>a</string></value>
                        <value><string>test</string></value>
                    </data>
                </array>
            `;

            expect(xml.innerHTML).toEqual(output.replace(/[\s]/g, ''));
        })

        it('should convert an array of different object to an </array> xml tag', function() {
            var xml = $js2xml.js2xml($doc, [true, false, 42, 3.14, null]);

            var output = `
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

            expect(xml.innerHTML).toEqual(output.replace(/[\s]/g, ''));
        })

        it('should convert an object literal into an </struct> xml tag', function() {
            var xml = $js2xml.js2xml($doc, {
                number: 42,
                string: "hello",
                boolean: true
            });

            var output = `
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

            expect(xml.innerHTML).toEqual(output.replace(/[\s]/g, ''));
        })

        it('should convert an Date object into an </date> xml tag', function() {
            var xml = $js2xml.js2xml($doc, new Date(1999, 11, 31, 23, 59, 59));

            var output = '<dateTime.iso8601>19991231T23:59:59</dateTime.iso8601>'

            expect(xml.innerHTML).toEqual(output);
        })

        it('should convert Uint8Array to </base64> xml tag', function() {
            var uint8array = new TextEncoder('utf8').encode('Hello world!');
            var xml = $js2xml.js2xml($doc, uint8array);
            expect(xml.innerHTML).toEqual('<base64>SGVsbG8gd29ybGQh</base64>');
        });

    });
});
