
exports.staticFsPath="../inframain/datastore/";
exports.grimoireFsPath="/var/www/static/grimoire/";
exports.grimoireUrlPath= "https://ff14.adhoc.click/grimoire/"
exports.pCloudUrl= "https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/"
exports.vaultPath="/home/ec2-user/.vault.donotdelete";

function padValue(v) { return "00".concat(v).slice(-2); } ;
function padValue3(v) { return "000".concat(v).slice(-3); } ;

exports.isLowerNumeric = str => /^[a-z0-9]+$/g.test(str);
exports.capitalizeFirstLetter = str => { return str.charAt(0).toUpperCase() + str.slice(1); } ;
exports.lowerFirstLetter = str => { return str.charAt(0).toLowerCase() + str.slice(1); } ;
exports.alphanum2placer = str => { return str.replace(/[a-z0-9]/g,"﹇") } ;
exports.stripBlank = str => { return str.replace(/[ \:\.\,]/g,"") };
exports.isPseudoValid = (str) => { return /^['\-A-Za-z0-9]+$/g.test(str); }

const flagProd = __filename.indexOf('/prod/') > 0

exports.isProd = () => {
	return flagProd
}

exports.countDownTo = (dth) => {
	if (dth==null || dth==undefined)
		return "--:--:--";
	const nbSec = Math.floor( (dth- Date.now()) / 1000);
	if (nbSec <= 0) return "00:00:00";
	const h = Math.floor(nbSec/3600);
	const m = Math.floor( (nbSec - h*3600) / 60);
	const s = Math.floor( nbSec % 60);
	return padValue(h) + "h" + padValue(m) + "m" + padValue(s)+"s";
}

exports.hhmmssms = ms => {
	if (ms) {
		let dth = new Date(ms);
		return	 padValue(dth.getHours())+":"
			+padValue(dth.getMinutes())+":"
			+padValue(dth.getSeconds())+"."
			+padValue3(dth.getMilliseconds());
	}
	return "--:--:--.---";
};

// ms est un nombre de millisecond
exports.jjmmhhmmss = (ms) => {
	if (ms) {
		let dth = new Date(ms);
		return "le "+padValue(dth.getDate())+"/"+padValue(dth.getMonth()+1)+" à "+padValue(dth.getHours())+":"+padValue(dth.getMinutes())+":"+padValue(dth.getSeconds());
	}
	return "...";
	
}



exports.uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

exports.exception = (message,code,startDth) => {
	// console.log("----------------------------------------");
	// console.log(message,code,startDth);
	// console.log("----------------------------------------");
	throw {
		code: code, 
		msg : (typeof message == "string")? message : "nomsg",
		o : (typeof message == "object")? message : null,
		dth: Date.now(),
		startDth: startDth
	}
}

exports.apiCall = async (fullUrl,method,body,headers) => {
	try {
		const res = await fetch(fullUrl, {
			method: method? method: 'GET', 	
			mode: "cors",
			cache: "no-store",
			body: (body)? JSON.stringify(body) : null,
			headers: (headers)? headers : { 'Content-Type': 'application/json; charset=UTF-8'}
		});
	  const json = await res.json();
		json.status = res.status;
		return json;
	}
	catch(e) {
		console.log(e);
		return { status: 503 };
	}
}

exports.apiCallHtml = async (fullUrl,method,body,headers) => {
	try {
		const res = await fetch(fullUrl, {
			method: method? method: 'GET', 	
			mode: "cors",
			cache: "no-store",
			body: (body)? JSON.stringify(body) : null,
			headers: (headers)? headers : { 'Content-Type': 'application/json; charset=UTF-8'}
		});
	  const text = await res.text();
	  const json = { status: res.status, text: text}
		return json;
	}
	catch(e) {
		console.log(e);
		return { status: 503 };
	}
}

exports.getImgSuffix = (contentType) => {
	if ( !contentType.startsWith('image/') ) return null
	return contentType.substring(contentType.indexOf('/')+1)
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
} 
exports.sleep = async (sec) => {
	await(delay(sec*1000));
}

console.log("****************************************************");
console.log("Running envronment: ", (flagProd)? "PRODUCTION" : "STAGING");
console.log("****************************************************");
console.log("gbl loaded");

