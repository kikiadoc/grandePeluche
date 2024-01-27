
const gbl = require('../infraback/gbl.js');
const collections = require('../infraback/collections.js');
const pseudos = require('../infraback/pseudos.js');
const jetons = require('../infraback/jetons.js');

const hautsFaits = collections.get("hautsFaits", true);

const hautsFaitsDesc = {
		broceliandeInitiatique: { jeton: 0 },
		uchronieInitiatique:	{ jeton: 0 },
		geographeJardins:	{ jeton: 0 }
};
// init/normalize de la collection si besoin
function init() {
	hautsFaits.id ??= {};
	Object.keys(hautsFaitsDesc).forEach( p => {
		hautsFaits.id[p] ??= { pseudos: {} } ;
	});
}

// test si hautFait marqué pour le pseudo
function isDone(pseudo, hautFait) {
	if (!hautsFaits.id[hautFait]) gbl.exception("hautFait non valide:"+hautFait,400);
	return (hautsFaits.id[hautFait].pseudos[pseudo]) ? true : false;
}
// marque le haut fait retourne 200 si deja fait, 201 si marqué, incrémente les jetons selon le haut fait
function flagIt(pseudo,hautFait) {
	if ( isDone(pseudo, hautFait) ) return 200;
	hautsFaits.id[hautFait].pseudos[pseudo] = { dth: Date.now() };
	collections.save(hautsFaits);
	if (hautsFaitsDesc[hautFait].jeton > 0) jetons.inc(pseudo,hautsFaitsDesc[hautFait].jeton);
	return 201;
}

exports.httpCallback = (req, res, method, reqPaths, body, pseudo, pwd) => {
	if (method=="OPTIONS") {
		res.setHeader('Access-Control-Allow-Methods', 'PUT');
		gbl.exception("AllowedCORS",200);
	}
	if (method=="PUT") {
		pseudos.check(pseudo,pwd);
		gbl.exception("Hautfait ok:"+reqPaths[2], flagIt(pseudo,reqPaths[2]) );
	}
	if (method=="GET") {
		switch ( reqPaths[2] ) {
			case null:
			case undefined:
				pseudos.check(pseudo,pwd,true);
				gbl.exception(hautsFaits,200);
		}
	}
	gbl.exception("bad op",400);
}

init();
console.log("hautsFaits loaded");
