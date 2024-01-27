
const gbl = require('../infraback/gbl.js');

// parse réponse du lodestone a la recherche de FullName,
// XIVAPI.com etant buggé, c'est un bypass...
// retourne son FF14ID ou null
// < a class="entry__link" href="/lodestone/character/ff14id/"> .... </a>
// dans contenu :
// <p class="entry__name">PRENON NOM</p>
function lodestoneParse(sTexte,fullName) {
	// debug affiche les <p class="entry__name">
	const dbgIndex = sTexte.indexOf('<p class="entry__name">')
	console.log("debug:", sTexte.substring(dbgIndex,dbgIndex+50) )
	let texte = sTexte.replaceAll('&#39;',"'");

  const sEntry='<p class="entry__name">'+fullName+'</p>'
  const sChar='href="/lodestone/character/'
  const k = texte.indexOf(sEntry)
  if (k<0) return null; // Aucune correspondance
  const s = texte.substring(k-500,k);
  const c = s.lastIndexOf(sChar)
  if (c<0) return null; // pas de FF14ID
  const f = c+sChar.length
  const ff14Id = parseInt(s.substring(f,f+20),10);
  console.log("Search:",fullName,"--> ff14Id:",ff14Id);
  return ff14Id
}

exports.getFF14Id = async function(prenom,nom,monde) {
	const fullName = prenom+" "+nom;
	ret = await gbl.apiCallHtml("https://ff14.adhoc.click/lodestone/character/?q="+fullName+"&worldname="+monde)
	if (ret.status!=200) { console.log("****ERREUR LODESTONE**",ret.status); return null;  }
	return lodestoneParse(ret.text,fullName)
}


console.log("lodestone loaded");
