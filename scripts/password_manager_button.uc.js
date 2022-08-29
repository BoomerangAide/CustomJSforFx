// 'Open Password Manager' button for Firefox 91+ by Aris

var CustomCSSforFx_icon_filename = 'padlock_classic.png'; //change to the filename (without path) of an icon from CustomCSSforFx

(function() {
			 
		try {
			
			Components.utils.import("resource:///modules/CustomizableUI.jsm");
			Components.utils.import("resource://gre/modules/LoginHelper.jsm");
			
			var {Services} = Components.utils.import("resource://gre/modules/Services.jsm", {});
			var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"].getService(Components.interfaces.nsIStyleSheetService);
			
			if(!CustomizableUI.getWidget("pw_manager_button")) {
					  
				CustomizableUI.createWidget({
					
					id: "pw_manager_button", // button id
					defaultArea: CustomizableUI.AREA_NAVBAR,
					removable: true,
					label: "Mots de passe", // button title
					tooltiptext: "Mots de passe", // tooltip title
					
					onCreated: function(button) {
					  return button;
					}
					
				});
				
			}
			  
			/* set icon */
			var button_icon;

			if(CustomCSSforFx_icon_filename === null) {
			  button_icon = 'chrome://browser/skin/login.svg';
			}
			else {
			  button_icon = 'file:///' +
					  Components.classes["@mozilla.org/file/directory_service;1"].getService( Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile).path.replace(/\134/g,'/') +
					  '/chrome/image/' +
					  CustomCSSforFx_icon_filename;
			}
		  
			// style button icon
			var uri = Services.io.newURI("data:text/css;charset=utf-8," + encodeURIComponent('\
			\
			  #pw_manager_button .toolbarbutton-icon {\
				list-style-image: url("'+button_icon+'") !important; /* icon / path to icon */ \
				fill: red !important; /* icon color name/code, red in original code */\
			  }\
			  #customization-content-container #pw_manager_button .toolbarbutton-icon, \
			  panelmultiview #pw_manager_button .toolbarbutton-icon {\
				width: 18px !important; \
				height: 18px !important; \
			  }\
			\
			'), null, null);

			sss.loadAndRegisterSheet(uri, sss.AGENT_SHEET);
				  
		} catch (e) {
			Components.utils.reportError(e);
		};

})();

let dl_button = document.getElementById("pw_manager_button");
	
if(dl_button != null) {
	 dl_button.onclick = (event) =>
		{
	
		if(event.button == '0') {
			
			let filterTxt;
			
			try {
				filterTxt = gBrowser.currentURI.host;
			}
			catch(exc) {
				filterTxt = null;
			}
			
			if(filterTxt == null) {
				LoginHelper.openPasswordManager(window, { entryPoint: 'mainmenu' })
			}
			else {
				LoginHelper.openPasswordManager(window, { filterString: gBrowser.currentURI.host, entryPoint: 'mainmenu' })
			} 
			
		}
		
};
}
