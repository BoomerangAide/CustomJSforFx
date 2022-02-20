var {Services} = Components.utils.import("resource://gre/modules/Services.jsm", {});

var OthersCustomizations = {
	init: async function() {
		
		await Services.search.wrappedJSObject._initObservers.promise;

		///
		/// Move Back and Forward button to personal toolbar
		///

		var perso_bar = document.getElementById('PersonalToolbar');
		var back_button = document.getElementById('back-button');
		var fwd_button = document.getElementById('forward-button');

		try {
			if(back_button != perso_bar.firstChild) {
				perso_bar.insertBefore(
					back_button,
					perso_bar.firstChild
				);
			}
		}
		catch(e) {}

		try {
			if(back_button.nextSibling != fwd_button) {
				perso_bar.insertBefore(
					fwd_button,
					back_button.nextSibling
				);
			}
		}
		catch(e) {}
		
		///
		/// Change sidebar button text to Bookmarks
		///		
		
		try {
			document.getElementById('sidebar-button').label = "Marque-pages";
		}
		catch(e) {}
		
		///
		/// Change NoScript button label to shorter one
		///
		
		function NoscriptButtonMutationObserver(mutations,local_observer) {
		  local_observer.disconnect();
		  mutations.forEach(
			mutation => { 
				if(mutation.target.getAttribute('label') != "NoScript") {
					mutation.target.setAttribute('label', "NoScript");
				}
			}
		  );
		  noscript_buttons.forEach(noscript_button => local_observer.observe(noscript_button, { attributes : true, attributeFilter : [ "label" ] }));
		}
		
		try {
		  var noscript_buttons = document.getElementsByTagName('toolbarbutton');
		  setTimeout( function() {
			  
			noscript_buttons = Array.from(noscript_buttons).filter(elem => elem.getAttribute('label').includes('NoScript'));
		    let mutationObserver = new MutationObserver(NoscriptButtonMutationObserver);
			
			noscript_buttons.forEach(noscript_button => { if(noscript_button.getAttribute('label') != "NoScript") { noscript_button.setAttribute('label', "NoScript"); }});
			noscript_buttons.forEach(noscript_button => mutationObserver.observe(noscript_button, { attributes : true, attributeFilter : [ "label" ] }));
			
		  },1000);		
		}
		catch(e) { console.log(e);}
		
		///
		/// Update login popup height (mainly for NationStates to prevent scrollbars
		///
		
		function PopupAutocompleteObservation(mutations, this_observer) {
			
			const popup_autocomplete = document.getElementById("PopupAutoComplete");
		
			if(popup_autocomplete.hasChildNodes()) {
			  
				this_observer.disconnect();
				
				setTimeout(function() {
				  
					let new_height = 4;
					let i = 0;
				
					while(i < popup_autocomplete.firstChild.children.length) {
						
						let item = popup_autocomplete.firstChild.children[i];
						
						if(!(item.getAttribute("collapsed") === "true") && item.scrollHeight > 0)
							new_height += item.scrollHeight;
						
						i++;
						
					}

					new_height = new_height + "px";

					if(popup_autocomplete.getAttribute("height") != new_height)
						popup_autocomplete.setAttribute("height", new_height);
				
					this_observer.observe(popup_autocomplete, { childList: true, subtree: true, attributes: true, attributeFilter : [ "collapsed" ] });
					
				}, 0);
			
			}
			else {
				popup_autocomplete.removeAttribute("height");
			}
			
		}
		
		try {
			const popup_autocomplete_observer = new MutationObserver(PopupAutocompleteObservation);
			popup_autocomplete_observer.observe(document.getElementById("PopupAutoComplete"), { childList: true, subtree: true, attributes: true, attributeFilter : [ "collapsed" ] });
		}
		catch(e) {}

	}
}

OthersCustomizations.init();
