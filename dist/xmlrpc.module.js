"use strict";
const angular = require("angular");
const service_1 = require("./service");
class XmlRpcService extends service_1.XmlRpcServiceAbstract {
    constructor($http) {
        super();
        this.$http = $http;
    }
    callMethodImpl(url, params) {
        return this.$http.post(url, params, { headers: { 'Content-Type': 'text/xml' } })
            .then(response => this.parseResponse(response.data))
            .catch(response => {
            if (response.status in this.configuration) {
                if (this.configuration[response.status]) {
                    this.configuration[response.status].call();
                }
            }
            return response;
        });
    }
}
XmlRpcService.$inject = ['$http'];
exports.XmlRpc = angular
    .module('xml-rpc', [])
    .service('XmlRpcService', XmlRpcService)
    .name;
