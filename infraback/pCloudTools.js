
const crypto = require('node:crypto');
const path = require('node:path');
const fs = require('node:fs');

const gbl = require('../infraback/gbl.js');
const vault = require('../infraback/vault.js');

const pCloudUrl = "https://eapi.pcloud.com/"
const pCloudDigest = "https://eapi.pcloud.com/getdigest"
const pCloudLoginUrl = "https://eapi.pcloud.com/userinfo?device=aws-ff14.adhoc.click&getauth=1&logout=1"
// const pCloudPublicFolderId=0; // root folder
// const pCloudPublicFolderId=1352966824; // Public folder
const pCloudPublicFolderId=8973403405; // AI-generated

// Charge le vault
const pCloudUser = vault.get("pCloud_usr")
const pCloudPw = vault.get("pCloud_pw")
const pCloudVaultAuthKey="pCloud_auth";
let pCloudAuth = vault.get(pCloudVaultAuthKey,true); // let car le auth token peut être modifié

function getSha1(txt) {
	let w = crypto.createHash('sha1');
	w.update(txt);
	return w.digest('hex');
}

async function pCloudLogin() {
	let ret;
	let json;
	// digest
	ret = await fetch(pCloudDigest);
	if (ret.status != 200) gbl.exception("Erreur sur pCloudDigest",ret.status);
	json = await ret.json();
	if (json.result != 0 || !json.digest) {
		console.log("json:",json);
		gbl.exception("bad response pCloudDigest",500);
	}
	// login
	let pwDigest = getSha1( pCloudPw + getSha1( pCloudUser.toLowerCase() ) + json.digest )
	let loginUrl = pCloudLoginUrl + "&username=" + pCloudUser +"&digest=" + json.digest + "&passworddigest=" + pwDigest
	ret = await fetch(loginUrl);
	if (ret.status != 200) gbl.exception("Erreur sur pCloudLogin",ret.status);
	json = await ret.json();
	if (json.result != 0 || !json.auth) {
		console.log("json:",json);
		gbl.exception("bad response pCloudLogin",500);
	}
	// save auth
	pCloudAuth = vault.put(pCloudVaultAuthKey,json.auth);
	console.log("pCloud login ok, auth stored");
	return pCloudAuth;
}

// Execute une requete pCloud et retourne le result pCloud (ou un http Status, formatté pCloud)
async function pCloudDirect(op,prm,method,body) {
	let url = pCloudUrl+op+"?auth="+pCloudAuth
	if (prm) url = url + prm;
	let ret;
	ret = await fetch(url, { method: method? method:'GET', body: (body)? body:null , mode: "cors", cache: "no-cache" } );
	if (ret.status != 200) return { result: ret.status }
	// recup le résultat
	return await ret.json();
}

// Execute une requete pCloud et retourne le result pCloud (ou un http Status, formatté pCloud)
// test si l'auth est ok, et si callpi avec un soucis d'auth, retente le login
// prm si indiqué doit commencer par un "&";
async function pCloudApiCall(op,prm,method,body) {
	let json;
	// si pas d'auth... login
	if (!pCloudAuth) await pCloudLogin();
	// si pas d'auth apres login, fail !
	if (!pCloudAuth) gbl.exception("no auth after pCloud retry login",500);
	// execute la requete...
	json = await pCloudDirect(op,prm,method,body);
	// si le retourne indique un soucis de login, retente le login puis le call
	if (json.result==1000 || json.result==2000) {
		// login
		console.log("pCloud LOGIN RETRY !!");
		if (! await pCloudLogin()) gbl.exception("no auth after pCloud retry login after auth fail",500);
		// retry 
		console.log("pCloud RETRY CALL !!");
		json = await pCloudDirect(op,prm,method,body);
	}
	return json;
}

// Dépose un fichier sur le public folder utilisé
async function pCloudPutPublicFile(filename) {
		let fnUri = encodeURIComponent(path.basename(filename));
		let contenu = await fs.promises.readFile(filename,null);
		console.log("pCloud upload file:",filename);
		return await pCloudApiCall("uploadfile","&filename="+fnUri+"&folderid="+pCloudPublicFolderId+"&nopartial=1",'PUT',contenu);
}

// affiche l'info du dossier public folder utilisé
async function pCloudInfoPublicDir() {
		return await pCloudApiCall("listfolder","&folderid="+pCloudPublicFolderId);
}

////////////////////////////////////////////////////////////////////////////////////////////////
exports.apiCall = pCloudApiCall
exports.putPublicFile = pCloudPutPublicFile
exports.infoPublicDir = pCloudInfoPublicDir

console.log("pCloudTools loaded");
