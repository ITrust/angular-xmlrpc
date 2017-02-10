import { createXMLConverter, Js2Xml } from '../src/converters/js2xml';
import { createHelper, Helper } from '../src/helpers';
import { deepEqual as assertDeepEqual, ok } from 'assert';


describe('src/converters/js2xml.ts', () => {

  let $js2xml: Js2Xml;
  let $helperXmlRpc: Helper;
  let $doc;

  beforeEach( () => {
      $js2xml = createXMLConverter();
      $helperXmlRpc = createHelper();
      $doc = $helperXmlRpc.createDocument('test');
  });

  it('should convert null to </nil> xml tag', () => {
    const xml = $js2xml.js2xml($doc, null);
    assertDeepEqual(xml.innerHTML, '<nil/>'); 
  });

  it('should convert string to </string> xml tag', () => {
    const xml = $js2xml.js2xml($doc, 'A string test');
    assertDeepEqual(xml.innerHTML,'<string>A string test</string>');
  });

  it('should convert a integer to </int> xml tag', () => {
    const xml = $js2xml.js2xml($doc, 64);
    assertDeepEqual(xml.innerHTML, '<int>64</int>');
  });

  it('should convert a double to </double> xml tag', () => {
    const xml = $js2xml.js2xml($doc, 3.14159265359);
    assertDeepEqual(xml.innerHTML, '<double>3.14159265359</double>');
  });

  it('should convert true to </boolean> xml tag', () => {
    const xml = $js2xml.js2xml($doc, true);
    assertDeepEqual(xml.innerHTML, '<boolean>1</boolean>');
  });

  it('should convert false to </boolean> xml tag', () => {
    const xml = $js2xml.js2xml($doc, false);
    assertDeepEqual(xml.innerHTML, '<boolean>0</boolean>');
  });

  it('should convert an array of strings to an </array> xml tag', () => {
    const xml = $js2xml.js2xml($doc, ["This", "is", "a", "test"]);

    const output = `
      <array>
        <data>
          <value><string>This</string></value>
          <value><string>is</string></value>
          <value><string>a</string></value>
          <value><string>test</string></value>
        </data>
      </array>
    `;

    assertDeepEqual(xml.innerHTML, output.replace(/[\s]/g, ''));
  });

  it('should convert an array of different object to an </array> xml tag', () => {
    const xml = $js2xml.js2xml($doc, [true, false, 42, 3.14, null]);

    const output = `
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

    assertDeepEqual(xml.innerHTML, output.replace(/[\s]/g, ''));
  });

  it('should convert an object literal into an </struct> xml tag', () => {
    const xml = $js2xml.js2xml($doc, {
      number: 42,
      string: "hello",
      boolean: true
    });

    const output = `
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

    assertDeepEqual(xml.innerHTML, output.replace(/[\s]/g, ''));
  });

  it('should convert an Date object into an </date> xml tag', () => {
    const xml = $js2xml.js2xml($doc, new Date(1999, 11, 31, 23, 59, 59));

    const output = '<dateTime.iso8601>19991231T23:59:59</dateTime.iso8601>'

    assertDeepEqual(xml.innerHTML, output);
  });

  it('should convert Uint8Array to </base64> xml tag', function() {
    const uint8array = new TextEncoder('utf8').encode('Hello world!');
    const xml = $js2xml.js2xml($doc, uint8array);
    assertDeepEqual(xml.innerHTML, '<base64>SGVsbG8gd29ybGQh</base64>');
  });
});