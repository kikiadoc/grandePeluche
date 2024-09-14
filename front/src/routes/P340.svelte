<script>
	import { onMount, onDestroy } from 'svelte';
	import { loadIt, storeIt, apiCall, urlCdn, addNotification, playVideo } from "./storage.js"

	import Epiq from './z/Epiq.svelte'
	import Ctrad from './Ctrad.svelte'
	
	// export let wsCallComponents
  export let pseudo
  export let page
  export let pageDesc = null
  export let pageDone = []
	// export let pseudoList = []
	// export let audioVolume
	
	const pageEpiqLbl = "P"+pageDesc.n + "_epiqStep"
	let step = loadIt(pageEpiqLbl,0)
  $: storeIt(pageEpiqLbl,step)

	// Gestion des reload, refresh etc..
	onMount(() => { })
	onDestroy(() => {	})

	// contexte d'execution (synch/server à déterminer)
	const ctxName = "hegemonie_"+pseudo
	let ctx = loadIt(ctxName,{})

	// affichage des hautfaits/résultats
	let dspResultats = null
	async function calcResultats() {
	}

	// validation du maitre de guilde
	function validationMaitrePecheur(newStep) {
		if (!ctx.maitrePecheur || ctx.maitrePecheur.toLowerCase() != "wawalago")
			return addNotification("Non, ce n'est pas "+ctx.maitrePecheur,"orange",10,"prout-long")
		storeIt(ctxName,ctx)
		playVideo("ff-7/ff-7-maitrePecheur",null,null,2);
		step=newStep
	}

</script>
<style>
</style>

{#if pseudo.startsWith("Kikiadoc")}
	<div class="adminCadre"> 
		<input type="button" value="ResetParchemin" on:click={()=>confirm('Reset le parchemin?') && apiCall("/asciens/admClearTrad",'PATCH')} />
	</div>
{/if}

<div>
  <input type="button" on:click={()=> step=0} value="Réafficher le lore" />
</div>

{#if dspResultats}
	{@const pseudos = Object.keys(dspResultats.pseudos)}
	<div class="popupCadre papier">
		<div class="close" on:click={()=>dspResultats=false} on:keypress={null} role="button" tabindex=0>X</div>
		<div class="popupZone">
			<div class="popupContent">
				Blablabla
				<br/>
				{#each pseudos as p,i}
					<span>{p} &nbsp;</span>
				{/each}
			</div>
			<div>Total: {pseudos.length} aventuriers</div>
		</div>
	</div>
{/if}


{#if step==0}
	<div class="reveal">
		<div>Te voila à nouveau {pseudo}.</div>
		<div class="br"/>
		Le congrés scientifique vient de se terminer. Je t'en fais ici la synthèse, c'était fabuleux!
		<div class="br"/>
		<a href="https://fr.wikipedia.org/wiki/Jean-Fran%C3%A7ois_Champollion" target="_blank">Champollion</a>
		nous a expliqué qu'un élément peut se traduire de différentes
		façons selon le contexte: un nombre, une lettre, un glyphe ou même un mot!!!
		Comme illustration, il a dévoilé la
		<a href="https://fr.wikipedia.org/wiki/Pierre_de_Rosette" target="_blank">Pierre de Qarn</a>
		qu'il a découverte au fond du temple éponyme et comportant de multiples traductions d'un même texte.
		<div class="br"/>
		Ensuite,
		<a href="https://fr.wikipedia.org/wiki/Lothar_Collatz" target="_blank">Callatz</a>
		nous a parlé de chiffrement.
		Il nous a démontré qu'une fonction mathématique peut servir à chiffrer ou déchiffrer une information.
		Il nous a encore indiqué qu'une fonction mathématique ne se limite pas à calculer un résultat en fonction de ses paramètres.
		Il a illustré son propos avec la 
		<a href="https://fr.wikipedia.org/wiki/Conjecture_de_Syracuse" target="_blank">Conjecture de Syracuse</a>.
		<div class="br"/>
		C'est alors qu'au fond de la salle de conférence,
		<a href="https://fr.wikipedia.org/wiki/Alan_Turing" target="_blank">Alan Turing</a>
		s'est levé et s'est exclamé:
		<br/>
		<span class="blinkMsg">Je sais déchiffrer le langage des Nouveaux Anciens !</span>
		<div class="br"/>
		Tous les orateurs, spectateurs et moi, nous nous
		sommes tous retourné vers lui comme d'une seule Peluche et lui avons simplement demandé: comment?
		<br/>
		<Epiq bind:step={step} oui=10 ouiVal="Et alors? Qu'a dit Alan?" />
	</div>
{/if}

{#if step==10}
	<div class="reveal">
		<a href="https://fr.wikipedia.org/wiki/Alan_Turing" target="_blank">Alan Turing</a>
		nous alors indiqué la traduction du feuillet du Grimoire de la Magie qui a brulé!
		<div class="br" />
		Les nombres se traduisent comme suit: 
		<br/>
		<i>Aux environs de 12≡guilde 8≡pêcheur, un maître de guilde saura...</i>
		<div class="br" />
		Comme les nouveaux anciens utilisent des 
		<a href="https://fr.wikipedia.org/wiki/Ellipse_(rh%C3%A9torique)" target="_blank">ellipses réthoriques</a>,
		le véritable texte est selon lui:
		<br/>
		<i>Aux environs de la guilde des pêcheurs, un maître de guilde saura...</i>
		<div class="br" />
		Ensuite il nous a indiqué comment traduire le language des Nouveaux Ansciens:
		<div class="br" />
		Les mots sont conservés, mais chaque nombre doit être décomposé selon la 
		<a href="https://fr.wikipedia.org/wiki/Conjecture_de_Syracuse" target="_blank">Conjecture de Syracuse</a>
		et obtenir un nombre que l'on peut alors associer selon la 
		<a href="https://fr.wikipedia.org/wiki/Pierre_de_Rosette" target="_blank">Pierre de Qarn</a>
		à un autre nombre, une lettre ou un mot.
		<br/>
		<Epiq bind:step={step} oui=30 ouiVal="Génial, mais très compliqué!" />
	</div>
{/if}

{#if step==30}
	<div class="reveal">
		Tu as raison, c'est très compliqué. Mais Alan est tellement surprenant!
		<div class="br" />
		Il a même imaginé
		<a href="https://fr.wikipedia.org/wiki/Bombe_(%C3%A9lectrom%C3%A9canique)" alt="" target="_blank">
			une bombe électromécanique
		</a>
		permettant à tout le monde de traduire le Nouvel Ancien en Eorzéen.
		<br/>
		<Epiq bind:step={step} oui=40 ouiVal="Je peux en avoir une?" />
	</div>
{/if}

{#if step==40}
	<div class="reveal">
		<div class="br" />
		Hélas, crafter une bombe électromécanique restera encore longtemps une
		<a href="https://fr.wikipedia.org/wiki/Exp%C3%A9rience_de_pens%C3%A9e" target="_blank">expérience de pensée</a>
		car les composants nécessaires n'ont pas encore été découverts:
		il faudrait 100 crocs de requin du 13ème reflet,
		100 mécanismes d'horloge de l'Ortho-temps et
		10 tonnes de poils de Kikiadoc.
		<br/>
		<Epiq bind:step={step} oui=50 ouiVal="Alors c'est mort?" />
	</div>
{/if}

{#if step==50}
	<div class="reveal">
		Peut-être pas...
		<div class="br" />
		Si les Nouveaux Anciens peuvent posséder les Ames d'Eorzéens,
		il doivent traduire	leur langage en Eorzéeen pour les diriger.
		<div class="br" />
		Cela veut dire que les Nouveaux Anciens utilisent un équivalent
		à la tablette Enigma d'Alan.
		<div class="br" />
		Et si le message incomplet était une indication permettant de récupérer une telle tablette?
		<div class="br" />
		Va à la Guilde des Pêcheurs, et note le nom du maître de guilde sur ton Parchemin:
		<p class="parchemin">
			Parchemin épique:
			<br/>
			<input type="text" bind:value={ctx.maitrePecheur} placeholder="maître pêcheur" on:keyup={(e) => e.key=="Enter" && validationMaitrePecheur()} />
			<input type="button" value=">" on:click={(e) => validationMaitrePecheur(60)} />
		</p>
	</div>
{/if}

{#if step==60}
	<div class="reveal">
		C'est fantastique, tu as grugé un Nouvel Ancien et tu as récupéré une Tablette de Traduction!
		<div class="br" />
		Je te propose de vérifier qu'elle fonctionne bien.
		<div class="br" />
		Selon Alan, le nombre 12 se traduit par Guilde. Peux-tu utiliser la Tablette
		pour réaliser la traduction selon la Conjecture de Syracuse?
		<br/>
		<Epiq bind:step={step} oui=70 ouiVal="Oui, bien sur!" />
	</div>
{/if}

{#if step==70}
	<div>
		<Ctrad ascVal=12 cbResolve={()=>step=80}/>
	</div>
{/if}

{#if step==80}
	<div class="reveal">
		C'est fabuleux, la Tablette de Traduction des Anciens fonctionne parfaitement.
		<div class="br" />
		Quand cela sera nécessaire, tu pourras à nouveau l'utiliser pour
		comprendre les écrits des Nouveaux Anciens.
		<div class="br" />
		<i>Tu as terminé ce challenge</i>
		<br />
		<Epiq bind:step={step} bind:page={page} bind:pageDone={pageDone}
			oui=80 ouiPage=0 ouiPageDone={pageDesc.n} ouiVal="Merci Grande Peluche"
			non=0 nonVal="Revoir le Lore"
			/>
	</div>
{/if}


{#if step==90}
	<div>
		<div class="br" />
		Ensuite il nous a indiqué comment traduire le language des Nouveaux Ansciens:
		<div class="br" />
		Les mots sont conservés, mais chaque nombre doit être décomposé selon la 
		<a href="https://fr.wikipedia.org/wiki/Conjecture_de_Syracuse" target="_blank">Conjecture de Syracuse</a>
		et obtenir un nombre que l'on peut alors, selon la 
		<a href="https://fr.wikipedia.org/wiki/Pierre_de_Rosette" target="_blank">Pierre de Qarn</a>,
		associer à un autre nombre, une lettre ou un mot.
		<br/>
		<Epiq bind:step={step} oui=20 ouiVal="Ca a l'air compliqué!" />
	</div>
{/if}



{#if step==99}
	<div>
		<p>
		<Ctrad pseudo={pseudo} />
			La Peluche Mathématicienne
			<a href="https://fr.wikipedia.org/wiki/Lothar_Collatz" target="_blank">Lothar Collatz</a>
			a énoncé, il y a seulement quelques décénies, la
			<a href="https://fr.wikipedia.org/wiki/Conjecture_de_Syracuse" target="_blank">Conjecture de Syracuse</a>
			qui permet de traduire l'Ancien en Eorzéen.
			Par définition, elle n'a pas encore été démontrée et de nombreuses Peluches Mathématicienne pensent obtenir la
			<a href="https://fr.wikipedia.org/wiki/M%C3%A9daille_Fields" target="_blank">Mascotte Fields</a>
			en prouvant la validité de cette conjecture.
		</p>
		<p>
			Mais l'important est qu'en utilisant cette conjecture, il est possible de traduire le langage numérique
			des Anciens en des chiffres et des lettres utilisées en Eorzéa.
		</p>
	</div>
  <Epiq bind:step={step} oui=1 ouiVal="Je pourrais comprendre les écritures des Anciens !" />
{/if}
{#if step==99}
	<div>
		<p>
			Oui {pseudo}, grâce à cette conjecture tu pourras comprendre l'écriture des Anciens.
			Et cela repose sur quelques opérations arithmétique élémentaires.
			Ainsi, un nombre Ancien peut se traduire en un chiffre, un nombre, une lettre
			et même un mot ou une phrase selon le contexte.
			Pourfois il suffit de quelques opérations, parfois il en faut des dizaines!
		</p>
		<p>
			Selon la Conjecture, la série de nombre converge vers 1 puis continue avec un cycle 1/4/2/1/4/2/1 etc..
			La traduction d'un nombre Ancien n'est donc pas le résultat final, il est connu,
			mais le nombre d'opérations nécessaires	pour arriver à la valeur 1.
		</p>
	</div>
  <Epiq bind:step={step} oui=2 ouiVal="Ca a l'air compliqué!" />
{/if}
{#if step==992}
	<div>
		<p>
			Mais non! Ne soit pas si effayé, il faut seulement quelques calculs très simples			
		</p>
		<p>
			En plus, je noterai dans ton grimoire personnel les résultats des traductions
			que tu auras réalisées afin que tu puisses facilement les réutiliser
			lorsque de nouvelles traductions te seront nécessaires.
		</p>
	</div>
  <Epiq bind:step={step} oui=3 ouiVal="Qu'est ce que mon grimoire personnel?" />
{/if}
{#if step==993}
	<div>
		<p>
			Oh! Je n'avais pas vu que tu n'avais pas encore obtenu ton grimoire personnel.
		</p>
		<p>
			Cela va être l'occasion pour toi d'aller le quémander auprès d'une guilde!
			<br/>
			Pour identifier cette guilde, il faut faire ta première traduction Ancien/Eorzéen!
		</p>
	</div>
  <Epiq bind:step={step} oui=99 ouiVal="Dis moi ce que je dois faire!" />
{/if}

{#if step==993}
	<div>
		<p>
			Mais tu sais déjà ce qu'est un grimoire personnel!
			<br/>
			Tu l'as déjà obtenu et tu as deux boutons importants.
			<br/>
			Le premier "Grimoire" te permet de consulter ton Grimoire,
			le second "Nouveau décodage" te permet de décoder un nombre Ancien en Eorzéen
		</p>
	</div>
  <Epiq bind:step={step} oui=99 ouiVal="J'avais oublié" />
{/if}

<!-- P340.svelte.com -->

