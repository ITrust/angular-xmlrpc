import { XmlRpc } from '../src/xmlrpc.module';
import { deepEqual as assertDeepEqual, ok } from 'assert';

describe('src/xmlrpc.module.ts', () => {
  beforeEach(angular.mock.module(XmlRpc));

  let $httpBackend;
  let $xmlrpc;

  beforeEach(() => {
    angular.mock.inject(function (_$filter_, _$httpBackend_, XmlRpcService) {
      $httpBackend = _$httpBackend_;
      $xmlrpc = XmlRpcService;
    });
  }); 

  it('should send a HTTP request sucessfully', done => {
    const response = `
      <methodResponse>
        <params>
          <param>
            <value>
              <string>A test method response</string>
            </value>
          </param>
        </params>
      </methodResponse>
    `;

    $httpBackend.expectPOST('http://123.123.123.123/RPC2')
      .respond(201, response);

    $xmlrpc.config({
      hostName: 'http://123.123.123.123',
      pathName: "/RPC2"
    });

    $xmlrpc.callMethod('test.method')
      .then(data => {
        assertDeepEqual(data, 'A test method response');
      })
      .finally(done)
    $httpBackend.flush();
  });

  it('should send a HTTP request and fail', done => {
    $httpBackend.expectPOST('http://127.0.0.1/RPC2')
      .respond(400, 'Hello');
    $xmlrpc.config({
      hostName: 'http://127.0.0.1',
      pathName: "/RPC2"
    });

    $xmlrpc.callMethod('test.method')
      .catch(error => {
        assertDeepEqual(error.status, 400);
      })
      .finally(done)
    $httpBackend.flush();
  });

  it('should send a HTTP request sucessfully and parse a complex response', done => {
    const response = `
      <methodResponse>
        <params>
          <param>
            <value>
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
            </value>
          </param>
        </params>
      </methodResponse>
    `;

    const expected = {
      number:42,
      string:'string',
      boolean: true
    };

    $httpBackend.expectPOST('http://123.123.123.123/RPC2')
      .respond(201, response);

    $xmlrpc.config({
      hostName: 'http://123.123.123.123',
      pathName: "/RPC2"
    });

    $xmlrpc.callMethod('test.method')
      .then(data => {
        assertDeepEqual(data, expected);
      })
      .finally(done)
    $httpBackend.flush();
  });
});