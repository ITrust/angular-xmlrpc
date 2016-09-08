describe('angular-xmlrpc', function() {

    beforeEach(module('xml-rpc'));

    var $httpBackend;
    var $xmlrpc;

    beforeEach(inject(function(xmlrpc, $injector){
        $httpBackend = $injector.get('$httpBackend');
        $xmlrpc = xmlrpc
    }));

    describe('xmlrpc', function() {

        it('should send a HTTP request sucessfully', function(done) {
            var response = `
            <methodResponse>
                <params>
                    <param>
                        <value>
                            <string>A test method response</string>
                        </value>
                    </param>
                </params>
            </methodResponse>
            `

            $httpBackend.expectPOST('http://123.123.123.123/RPC2')
                .respond(201, response);

            $xmlrpc.config({
                hostName: 'http://123.123.123.123',
                pathName: "/RPC2"
            })

            $xmlrpc.callMethod('test.method')
                .then(function(data) {
                    expect(data).toEqual('A test method response')
                })
                .catch(function(error) {
                    expect(error).toBeNull()
                })
                .finally(done)

            $httpBackend.flush();
        })

        it('should send a HTTP request and fail', function(done) {
            $httpBackend.expectPOST('http://127.0.0.1/RPC2')
                .respond(400, 'Hello');
            $xmlrpc.config({
                hostName: 'http://127.0.0.1',
                pathName: "/RPC2"
            })

            $xmlrpc.callMethod('test.method')
                .then(function() {
                    expect(true).toBe(false)
                })
                .catch(function(error) {
                    expect(error.status).toBe(400)
                })
                .finally(done)

            $httpBackend.flush();
        })

    });
});
