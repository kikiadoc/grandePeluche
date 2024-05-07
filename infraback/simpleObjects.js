const gbl = require('../infraback/gbl.js');
const fs = require('fs');

exports.load = (name) => {
	try {
		const rawObj = fs.readFileSync(gbl.staticFsPath+name+".object");
		const jsonObj = JSON.parse(rawObj);
		if (jsonObj.name != name) throw new Error("object "+name+" malformé, reinit");
		return jsonObj;
	}
	catch(e) {
		console.log(e);
	}
	return { name: name }
}

console.log("simpleObjects loaded");
