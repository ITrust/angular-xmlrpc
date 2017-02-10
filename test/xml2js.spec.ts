import { createJSConverter, Xml2JS } from '../src/converters/xml2js';
import { createHelper, Helper } from '../src/helpers';
import { deepEqual as assertDeepEqual, ok } from 'assert';


describe('src/converters/xml2js.ts', () => {

  let $xml2js: Xml2JS ;
  let $helperXmlRpc: Helper;

  beforeEach( () => {
      $xml2js = createJSConverter();
      $helperXmlRpc = createHelper();
  });

  it('should convert <nil/> to null', () => {
    const xml: string = '<nil/>';
    const node = $helperXmlRpc.loadXml(xml);
    const result = $xml2js.xml2js(node);
    assertDeepEqual(result, null);
  });
 
  it('should convert a <string> tag to a string', () => {
    const xml: string = '<string>This is a test</string>'
    const node = $helperXmlRpc.loadXml(xml);
    const result = $xml2js.xml2js(node);
    assertDeepEqual(result, 'This is a test');
  });

  it('should convert a <int> tag to an integer', () => {
    const xml: string = '<int>64</int>'
    const node = $helperXmlRpc.loadXml(xml);
    const result = $xml2js.xml2js(node);
    assertDeepEqual(result, 64);
  });

  it('should convert a <i4> tag to an integer', () => {
    const xml: string = '<i4>128</i4>'
    const node = $helperXmlRpc.loadXml(xml);
    const result = $xml2js.xml2js(node);
    assertDeepEqual(result, 128);
  });

  it('should convert a tag <i8> to a number', () => {
    const xml: string = '<i8>256</i8>';
    const node = $helperXmlRpc.loadXml(xml);
    const number = $xml2js.xml2js(node);
    assertDeepEqual(number, 256);
  });

  it('should convert a <double> tag to a float', () => {
    const xml: string = '<double>3.1415</double>'
    const node = $helperXmlRpc.loadXml(xml);
    const result = $xml2js.xml2js(node);
    assertDeepEqual(result, 3.1415);
  });

  it('should convert a <boolean> tag to true', () => {
    const xml: string = '<boolean>1</boolean>'
    const node = $helperXmlRpc.loadXml(xml);
    const result = $xml2js.xml2js(node);
    assertDeepEqual(result, true);
  });

  it('should convert a <boolean> tag to false', () => {
    const xml: string = '<boolean>0</boolean>'
    const node = $helperXmlRpc.loadXml(xml);
    const result = $xml2js.xml2js(node);
    assertDeepEqual(result, false);
  });

  it('should convert a <struct> tag to an object literal', () => {
    const xml: string = `
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
    const node = $helperXmlRpc.loadXml(xml);
    const result = $xml2js.xml2js(node);
    assertDeepEqual(result, {
      number: 42,
      string: 'hello',
      boolean: true
    });
  });

  it('should convert a <array> tag to an array', () => {
    const xml: string = `
      <array>
        <data>
          <value><string>This</string></value>
          <value><string>is</string></value>
          <value><string>a</string></value>
          <value><string>test</string></value>
        </data>
      </array>
    `;
    const node = $helperXmlRpc.loadXml(xml);
    const result = $xml2js.xml2js(node);
    assertDeepEqual(result, ['This', 'is', 'a', 'test']);
  });

  it('should convert a <array> tag to an array of different types', () => {
    const xml: string = `
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
    const node = $helperXmlRpc.loadXml(xml);
    const result = $xml2js.xml2js(node);
    assertDeepEqual(result, [true, false, 42, 3.14, null]);
  });

  it('should convert a <dateTime.iso8601> tag to a date object', () => {
    const xml: string = '<dateTime.iso8601>19991231T23:59:59</dateTime.iso8601>'
    const node = $helperXmlRpc.loadXml(xml);
    const result = $xml2js.xml2js(node);
    assertDeepEqual(result, new Date(1999, 11, 31, 23, 59, 59));
  });

  it('should convert a <dateTime> tag to a date object', () => {
    const xml: string = '<dateTime>19991231T23:59:59</dateTime>'
    const node = $helperXmlRpc.loadXml(xml);
    const result = $xml2js.xml2js(node);
    assertDeepEqual(result, new Date(1999, 11, 31, 23, 59, 59));
  });
     
  it('should convert a <base64> tag to a string value', () => {
    const xml: string = '<base64>VGhpcyBpcyBhIHRlc3Q=</base64>'
    const node = $helperXmlRpc.loadXml(xml);
    const result = $xml2js.xml2js(node);
    assertDeepEqual(result, "VGhpcyBpcyBhIHRlc3Q=");
  })
});