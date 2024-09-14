<script>
	import {addNotification, urlImg} from './storage.js'
	
	export let cbImageRaw // callback avec le contenu raw d'un fichier cbData(rawData)
	export let maxSize = 8000000 // taille maximale
	
	// e=event change d'un input type=file
	function validateImageUpload(eventFileInput,tagImg) {
		// console.log(eventFileInput)
		const file = eventFileInput.target.files[0]
		const reader = new FileReader();
		const image = eventFileInput.target.nextElementSibling // <img>
		if (!file || !reader || !image) return addNotification("Erreur interne client sur validateImageUpload","red",60)
		reader.addEventListener("loadstart", () => {
			image.src = urlImg+"sablierAnime.gif"
		}, false);
		reader.addEventListener("load", () => {
			image.src = urlImg+"uploadFile.png"
			const PREFIX='data:image/'
			const raw=reader.result
			// verifs
			// console.log("image size=",raw.length);
			if (reader.result.length > maxSize)
				return addNotification("Image trop grosse (max "+maxSize+')',"red",10,'prout-long')
			if (! raw.startsWith(PREFIX))
				return addNotification("Image invalide","red",10,'prout-long')
		  // index des séparateurs
		  const pPointVirg = raw.indexOf(';')
			const pVirg = raw.indexOf(',')
		  // extraction du type et encoding
		  const mimeType = raw.substring(PREFIX.length,pPointVirg)
		  const encoding = raw.substring(pPointVirg+1,pVirg)
			// vérif....
		  if (mimeType!="jpg" && mimeType != "jpeg" && mimeType !="png")
				return addNotification("Image JPG, JPEG, PNG requis","red",10,'prout-long')
			// image OK
		  console.log("image: mime:",mimeType,"encoding:",encoding,"size",reader.result.length);
			image.src = reader.result
			// callback
			cbImageRaw && cbImageRaw(reader.result)
		}, false);
		reader.readAsDataURL(file);
	}
</script>
<style>
	.dropZone {cursor:pointer; width:100% }
	:global(.dragOver) { outline: 5px solid red }
</style>

<label>
	<input type="file" accept="image/jpeg, image/jpg, image/png"
		style="display: none"
		on:change={(e)=>validateImageUpload(e,'dspChoixPreview')}
	/>
	<img class="dropZone" alt=""
		on:drop={(e)=>{ 
			console.log('drop',e)
			e.preventDefault();
			e.target.classList.remove("dragOver");
			if (e.dataTransfer.files) {
				let fileInp=e.target.previousElementSibling // <input file>
				fileInp.files = e.dataTransfer.files;
				const event = new Event("change",{ bubbles: false} );
				fileInp.dispatchEvent(event);
			}
		}}
		on:paste={(e)=>{ e.preventDefault(); console.log('paste');
			let fileInp=e.target.previousElementSibling // <input file>
			fileInp.files = e.clipboardData.files;
		}}
		on:dragover={(e)=>{ e.preventDefault(); e.target.classList.add("dragOver");} }
		on:dragleave={(e)=>{ e.preventDefault(); e.target.classList.remove("dragOver");} }
		src="https://filedn.eu/lxYwBeV7fws8lvi48b3a3TH/uploadFile.png"
	/>
</label>

