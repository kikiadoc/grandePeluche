

const gbl = require('../infraback/gbl.js');
const collections = require('../infraback/collections.js');
const wsserver = require('../infraback/wsserver.js');
const pseudos = require('../infraback/pseudos.js');
const jetons = require('../infraback/jetons.js');


exports.httpCallback = (req, res, method, reqPaths, body, pseudo, pwd) => {
	switch ( method ) {
		case "GET":
			switch ( reqPaths[2] ) {
				case "test":
					pseudos.check(pseudo,pwdtrue); // admin
					
					gbl.exception("ok",200);
			}
	}
	gbl.exception("Err param",400);
}

console.log("broceliande loaded");

