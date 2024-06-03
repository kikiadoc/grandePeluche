
const crypto = require('crypto');

const gbl = require('../infraback/gbl.js');
const collections = require('../infraback/collections.js');
const wsserver = require('../infraback/wsserver.js');
const pseudos = require('../infraback/pseudos.js');
const pCloud = require('../infraback/pCloudTools.js');
const discord = require('../infraback/discord.js');

const FILE_FWRULES_JSON = "/home/ec2-user/checksec/datastore/gp-firewall.json"
const FILE_YUMUPDATE = "/home/ec2-user/checksec/datastore/yumUpdate.txt"
const FILE_REPORT = "/home/ec2-user/checksec/datastore/report.txt"
const FILE_YUMUPDATE_JSON = "/home/ec2-user/checksec/datastore/yumUpdate.json"
const FILE_REPORT_JSON = "/home/ec2-user/checksec/datastore/report.json"
const PUB_REPORT = gbl.pCloudUrl+"AI-Generated/report.txt"
const PUB_YUMUPDATE = gbl.pCloudUrl+"AI-Generated/yumUpdate.txt"
const PUB_FWRULES = gbl.pCloudUrl+"AI-Generated/gp-firewall.json"

// report admin quotidien
function admDiscordReport() {
	// chargment des json
	const reportJson = collections.loadJsonFile(FILE_REPORT_JSON)
	const yumUpdateJson = collections.loadJsonFile(FILE_YUMUPDATE_JSON)
	// cumul et synthèse
	// message sur discord
	const message = "Rapport quotidien CheckSec V3 ("+  gbl.jjmmhhmmss(reportJson.dthSecond*1000) +" UTC)\n"+
									"\nFirewall #2: "+ 0 + " tentatives illégales en sortie"+
									"\nFirewall #3: "+ reportJson.nbFwRules + " nouvelles règles de ban à analyser"+
									"\nReverse Proxy: "+ reportJson.nbAlert + " IP ban dans le honeypot"+
									"\nReverse Proxy: "+ (reportJson.nbIp-reportJson.nbAlert) + " IP considérées scanner internet whiteHat"+
									"\nReverse Proxy: "+ reportJson.nbFiltered + " URL dans le honeypot"+
									"\nDernier patch Securité système: "+ gbl.jjmmhhmmss(yumUpdateJson.dthSecond*1000) +" UTC"+
									"\n"+
									"\nSecurityReport: <"+PUB_REPORT+">"+
									"\nPatch Système:<"+PUB_YUMUPDATE+">"+
									"\nRègles FW:<"+PUB_FWRULES+">"+
									"\n\nFin du rapport quotidien"+
									"\n\nRAW:\n"+JSON.stringify(reportJson)+"\n"+JSON.stringify(yumUpdateJson)
	discord.postMessage( gbl.isProd()? "test" : "test", message,true)
}

exports.httpCallback = async (req, res, method, reqPaths, body, pseudo, pwd) => {
	switch (method) {
		case "GET":
			// public access
			switch(reqPaths[2]) {
				case "forceClientVersion":
					const v = wsserver.forceClientVersion();
					gbl.exception("ok clientVersionReq="+v,200);
				default:
					gbl.exception("adminTest GET invalide",400);
			}
		case "OPTIONS":
			pseudos.check(pseudo,pwd,true); // adm only
			res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE');
			gbl.exception("AllowedCORS",200);
		case "PUT":
			// public acess en admin local
			if (pseudo || pwd) gbl.exception( "Not local admin" ,400)
			switch(reqPaths[2]) {
				case "pCloudUploadFirewallRules":
					await pCloud.putPublicFile(FILE_FWRULES_JSON);
					gbl.exception( "pCloudUploadFirewallRules" ,200);
				case "pCloudUploadYumUpdate":
					await pCloud.putPublicFile(FILE_YUMUPDATE);
					gbl.exception( "pCloudUploadYumUpdate" ,200);
				case "pCloudUploadCheckSecReport":
					await pCloud.putPublicFile(FILE_REPORT);
					gbl.exception( "pCloudUploadCheckSecReport" ,200);
				case "discordReport":
					await admDiscordReport()
					gbl.exception( "discordReport" ,200);
				case "pCloudInfo":
					let pCloudInfo = await pCloud.infoPublicDir();
					console.log(pCloudInfo.metadata.contents);
					let metaFiltered = pCloudInfo.metadata.contents.filter((e) => e.name=="AI-Generated");
					console.log(metaFiltered);
					gbl.exception("pCloudInfo" ,200);
				default:
					gbl.exception("adminTest PUT invalide",400);
			}
		case "DELETE":
			pseudos.check(pseudo,pwd,true); // adm only
			switch(reqPaths[2]) {
				case "clearServerPublicKey":
					pseudos.clearServerPublicKey(pseudo);
					gbl.exception("ok",200);
				default:
					gbl.exception("adminTest DELETE invalide",400);
			}
	}
	gbl.exception("inv http op adminTest",400);
}


console.log("adminTest loaded");
