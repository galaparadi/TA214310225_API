const rp = require('request-promise-native');


//base url untuk REST API
const BASE_URL = 'http://localhost/api';

//Setting default untuk modul request
let option = {
	baseUrl : BASE_URL,
	json : true,
}

//Standart methods REST API
let METHODS = {
	GET : function(data) {
		return rp(option);
	},
	PUT : function(data){
		option.data = data;
		return Promise.resolve(null);
	},
	POST : function(data){
		option.data = data;
		return Promise.resolve(null);
	},
	DELETE : function(data){
		return Promise.resolve(null)
	},
}


class RAPI {
	constructor(){

	}

	User(username){
		option.url = `/u/${username}`;
		return {
			__proto__ : METHODS,

		};
	}

	Workspace(name){
		option.url = `/w/${name}`;
		return {
			__proto__ : METHODS,
			GetDocument : function(docId){
				option.url = `${option.url}/document/${docId}`;
				return rp(option);
			},
			GetDocuments : function(){
				option.url = `${option.url}/documents`;
				return rp(option);
			},
			GetUsers : function(){
				option.url = `${option.url}/users`
				return rp(option);
			}
		};
	}
}

module.exports = new RAPI();