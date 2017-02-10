import * as angular from 'angular';
import { XmlRpcServiceAbstract } from './service';

class XmlRpcService extends XmlRpcServiceAbstract {

  static $inject = ['$http'];
  constructor(private $http: ng.IHttpService) {
    super();
  }

  callMethodImpl(url, params) {
    return this.$http.post(url, params, {headers: {'Content-Type': 'text/xml'}})
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

export const XmlRpc = angular
  .module('xml-rpc', [])
  .service('XmlRpcService', XmlRpcService)
  .name;