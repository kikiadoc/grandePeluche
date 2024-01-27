
const gbl = require('../infraback/gbl.js');
const fs = require('fs');
const https = require('https');

let pseudos = {};

function initPseudos() {
	console.log("--- init pseudos ---");
	fs.readdirSync(gbl.staticFsPath).forEach(file => {
  		const radical = file.split('.');
  		if (radical[1]=='pseudo') {
      			const rawUser = fs.readFileSync(gbl.staticFsPath+file);
      			pseudos[radical[0]]=JSON.parse(rawUser);
      			console.log("User loaded: ",file);
  		}
	});
	console.log("--------------------");
}

exports.get = (pseudo) => {
	return pseudos[pseudo];
}
exports.exist = (pseudo) => {
	return pseudos[pseudo] != null;
}

// recherche de pseudo par nick (xx yy @monde)
exports.getByNick = (nick) => {
	if (!nick) { console.log("***** getByNick Syntax",nick); return null; }
	let atPos = nick.indexOf('@');
	if (atPos <=2) { console.log("***** getByNick Syntax",nick); return null; }
	let fullName = nick.substring(0,atPos-1)
	let monde = nick.substring(atPos+1)
	for (let pseudo in pseudos) {
		if (pseudos[pseudo].fullName==fullName && pseudos[pseudo].monde==monde) {
			console.log("nick2pseudo:", nick, "->", pseudo);
			return pseudo;
		}
	}
	console.log("***** getByNick NotFound",nick,fullName,monde)
	return null;
}

function savePseudo(pseudo,desc) {
	desc.lastLogin = Date.now();
	fs.writeFileSync(gbl.staticFsPath+pseudo+".pseudo", JSON.stringify(desc));
}

// admin pour upgrade version sans FF14ID ver version avec FF14ID
function forceId(pseudo,ff14Id) {
	let desc = pseudos[pseudo]
	if (!desc) gbl.exception("Pseudo not found:"+pseudo,404);
	desc.ff14Id = ff14Id;
	savePseudo(pseudo,desc);
	return desc;
}

function definePseudo(body) {
	// recupere les options..
	const o = JSON.parse(body);
	const pseudo = o.pseudo;
	const nom = o.nom;
	const monde = o.monde;
	const ff14Id  = o.ff14Id ;

	if (! gbl.isPseudoValid(pseudo)) gbl.exception("Prenom IG invalide", 400);
	if (! gbl.isPseudoValid(nom)) gbl.exception("Nom IG invalide", 400);

	// verification selon le ff14id que le pseudo n'existe pas encore
	let pseudoExist = Object.values(pseudos).find ( (pseudo) => pseudo.ff14Id == ff14Id);
	if (pseudoExist) gbl.exception("joueur déjà enregistré via ff14Id",403);

	// le ff14Id n'est pas encore connu, construit le pseudo en evitant les pseudos existants
	let suffixe = "";
	while (pseudos[pseudo+suffixe])
		suffixe = (suffixe!="")? suffixe+1 : 1;
	const newUser = pseudo+suffixe;

	const newUserDesc = { pseudo: newUser , pwd: gbl.uuidv4() , dth: Date.now(), fullName: pseudo+" "+nom, monde: o.monde, ff14Id: ff14Id };
	console.log("New User! ", newUserDesc);
	pseudos[newUser] = newUserDesc;
	savePseudo(newUser,newUserDesc);
	console.log('pseudo defini:',newUserDesc);
	return newUserDesc;
}

function checkPseudo(pseudo,password, reqAdmin) {
	if (!pseudo || !password) gbl.exception("bad credentials", 403);
	const pseudoDesc = pseudos[pseudo];
	if ( !pseudoDesc ) gbl.exception("pseudo introuvable", 403);
	if ( pseudoDesc.pwd != password ) gbl.exception("bad password", 403);
	if ( reqAdmin && (pseudo != "Kikiadoc") ) gbl.exception("Not admin", 403);
	if ( (!pseudoDesc.lastLogin) || (pseudoDesc.lastLogin < (Date.now()-3600000) ) )
		savePseudo(pseudo,pseudoDesc);
	return pseudoDesc;
}
exports.check = checkPseudo; 

function deletePseudo (pseudo) {
	const pseudoDesc = pseudos[pseudo];
	if ( !pseudoDesc ) gbl.exception("pseudo introuvable", 403);
	delete pseudos[pseudo] ;
	fs.unlinkSync(gbl.staticFsPath+pseudo+".pseudo");
	return pseudoDesc;
}

exports.httpCallback = (req, res, method, reqPaths, body, pseudo, pwd) => {
	if (method=="OPTIONS") {
		res.setHeader('Access-Control-Allow-Methods', 'DELETE, PUT');
		gbl.exception("AllowedCORS",200);
	}
	else
	if (method=="DELETE") {
		checkPseudo(pseudo,pwd,true);
		let ret= deletePseudo(reqPaths[2]);
		gbl.exception(ret,200);
	}
	else
	if (method=="PUT") {
		let ret= definePseudo( body );
		gbl.exception(ret,200);
	}
	else
	if (method=="POST") {
		// cas particullier de modif admin du ff14ID d'un pseudo
		checkPseudo(pseudo,pwd,true);
		let ret= forceId( reqPaths[2], parseInt(reqPaths[3],10) );
		gbl.exception(ret,200);
	}
	else
	if (method=="GET") {
		checkPseudo(pseudo,pwd,true);
		gbl.exception(pseudos,200);
	}
	gbl.exception("bad op pseudos",400);
}

initPseudos();

console.log("Pseudos loaded");

