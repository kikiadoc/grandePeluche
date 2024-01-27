
const crypto = require('crypto');

const gbl = require('../infraback/gbl.js');
const collections = require('../infraback/collections.js');
const wsserver = require('../infraback/wsserver.js');
const pseudos = require('../infraback/pseudos.js');
const pCloud = require('../infraback/pCloudTools.js');


function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
} 

async function doWait(n) {
	// delay(Math.floor(10000*Math.random())).then( ()=> console.log("finDoWaitDelay") );
	// await delay(Math.floor(5000+5000*Math.random()))
	console.log('debutDowait',n);
	await delay(1000*n);
	console.log('finDowait',n);
	// await delay(Math.floor(5000));
}

exports.httpCallback = async (req, res, method, reqPaths, body, pseudo, pwd) => {
	// auth uniquement admin
	pseudos.check(pseudo,pwd,true);
	
	switch (method) {
		case "OPTIONS":
			res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE');
			gbl.exception("AllowedCORS",200);
		case "GET":
			switch(reqPaths[2]) {
				case "doWait":
					let debut = Date.now();
					await doWait(5);
					gbl.exception({ msg: "okDoWaitCourt", debut: debut } ,200);
				case "doWaitLong":
					let debut2 = Date.now();
					await doWait(10);
					gbl.exception({ msg: "okDoWaitLong", debut: debut2 } ,200);
				case "pCloudUpload":
					await pCloud.putPublicFile("/home/ec2-user/testBinaryFile.mp3");
					gbl.exception({ msg: "pCloud" } ,200);
				case "pCloudInfo":
					let pCloudInfo = await pCloud.infoPublicDir();
					console.log(pCloudInfo.metadata.contents);
					let metaFiltered = pCloudInfo.metadata.contents.filter((e) => e.name=="AI-Generated");
					console.log(metaFiltered);
					gbl.exception({ msg: "pCloud" } ,200);
				default:
					gbl.exception("adminTest GET invalide",400);
			}
		case "PUT":
			switch(reqPaths[2]) {
				default:
					gbl.exception("adminTest PUT invalide",400);
			}
		case "DELETE":
			switch(reqPaths[2]) {
				default:
					gbl.exception("adminTest DELETE invalide",400);
			}
	}
	gbl.exception("inv http op adminTest",400);
}


console.log("adminTest loaded");
