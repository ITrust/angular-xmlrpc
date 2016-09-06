describe('angular-xmlrpc', function() {

  beforeEach(module('xml-rpc'));

  var $xml2js;
  var $helperXmlRpc;

  beforeEach(inject(function(xml2js, helperXmlRpc){
    $xml2js = xml2js;
	$helperXmlRpc = helperXmlRpc;
  }));

  describe('xml2js', function() {

    it('should convert a tag <i8> to a number', function() {
		var xml = '<i8>256</i8>';
		var node = $helperXmlRpc.loadXml(xml);
		var number = $xml2js.xml2js(node);
		expect(number).toEqual(256);
    });

  });
});