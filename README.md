angular-xmlrpc
==============

An AngularJS service which provides XML-RPC communication methods.

How to use it ?
---------------

First of all, add in you application a dependency :

    angular.module('MyApp', ['xml-rpc']);

This is an AngularJS service, you can use it in your application as any other service.

    angular.module('MyApp')
    .factory('MyAwesomeService', ['xmlrpc', function(xmlrpc){
        return {
            myAwesomeFunction: function(){
                xmlrpc.callMethod(...)
            }
        }
    }]);

In order to pass parameters, you have to wrap them in an array:

    myAwesomeFunction: function(){
        xmlrpc.callMethod('cookies.giveMe', [params1, params2, ...])
    }

Response from the server is automatically parsed from XML to a JS object, you can use it directly:

    xmlrpc.callMethod('user.me', []).then(function(response){
        console.log(response); // { attr1:..., attr2:...}
    })

Configuration
-------------

You can configure the hostName and pathName of your xmlrpc webservice. You can also define a callback for each http error you want:

    angular.module('MyApp.controllers', [])
    .controller('MyAwesomeController', function(xmlrpc) {
        xmlrpc.config({
            hostName:"...", // Default is empty
            pathName:"/..." // Default is /rpc2
            401:function(){
                console.log("You shall not pass !");
            },
            404:function(){
                console.log("Not the droids you're looking for");
            },
            500:function(){
                console.log("Something went wrong :(");
            }, ...
    });

Rock on ! \m/
