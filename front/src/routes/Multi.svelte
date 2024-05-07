<script>
	import { onMount, onDestroy, tick  } from 'svelte';
	import { apiCall, hhmmss, playDing, playSound, loadIt } from "./storage.js";

	onMount(() => { console.log('mount MultiPopup') });
	onDestroy(() => { console.log('destroy MultiPopup') });

	// BINDING OBLIGATOIRE
	export let onClose;
	export let pseudoList = [];
	export let chatMsgList = [];
	let pseudo = loadIt("pseudo",null);

	//
	// Broadcast d'un message
	//
	let inputText = null; // via bind
	function sendMsg() {
					if (inputText) {
									apiCall("/chatMsg","POST", {texte: inputText} );
									playSound("BlaBlaBla");
									inputText=null;
					}
	}
	function sendAdmin() {
					if (inputText) apiCall("/adminMsg","POST", {texte: inputText, admin:true} ) ;
					inputText=null;
	}
	//
	// Autoscroll
	//
	let scrollArea = null;
	$: if(chatMsgList && scrollArea) { console.log("autoscoll updated values") ; scrollToBottom(scrollArea) }
  const scrollToBottom = async (node) => { await tick(); node.scroll({ top: node.scrollHeight, behavior: 'smooth' }); };

	// gestion de la validation par enter:
	function testKey(e) {
		if (e.keyCode==13) sendMsg();
	}

</script>

<style>

	.popup {
		z-index: 5000;
		position: fixed;
		background-color: grey;
		/* background-image: url("https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/stars.gif"); */
		background-image: url("https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/texture-papier-noir.jpg");
		background-position: center;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
		border: 2px outset red;
		border-radius: 10%;
		border-width: 5%;
		padding: 0.5em 0.5em 0.5em 1em;
		color: white;
		text-shadow: none;
		font-size: 0.8em;
	}
	close {
		position: absolute;
		right: 0;
		top: -0.5em;
		font-size: 2em;
		background: #E2E8F0;
		color: #64748B;
		border: unset;
		border-radius: 6px;
		cursor: pointer;
	}
	.inputCadre { border: 5px solid black; }
	.inputText {    font-family: "Times New Roman"; font-size: 1em; width: 75%      }
	.inputButton {  font-family: "Times New Roman"; font-size: 1em; width: 20%; cursor: pointer     }
	.scrollbar { scrollbar-color: white green; scrollbar-width: auto; overflow-y: scroll;  }

</style>


<div class="popup">
        <close class="close" on:click={onClose} on:keypress={null} role="button" tabindex=0>X</close>
        <div>
                {pseudoList.length} connecté{#if pseudoList.length > 1}s{/if} :
                {#each pseudoList as name, i}
                         {name} &nbsp;
                {/each}
        </div>
        <div bind:this={scrollArea} class="inputCadre scrollbar" style="height: 7em" >
                {#each chatMsgList as o,i}
                        <div>{hhmmss(o.dth)} ({(o.fromPseudo)? o.fromPseudo : "Grande Peluche"}) {o.texte}</div>
                {/each}
        </div>
        <div>
                <input class="inputText" bind:value={inputText} type="text" maxlength="60" on:keypress={testKey}/>
                <input class="inputButton" type="button" value="►" on:click={sendMsg} />
                {#if pseudo=="Kikiadoc"}
                        <input class="inputButton" type="button" value="AdminAlert" on:click={sendAdmin} />
                {/if}
        </div>
</div>



