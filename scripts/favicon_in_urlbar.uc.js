// 'Favicon in urlbars identity box' script for Firefox 115+ by Aris then modified by UndeadStar
//
// This script restores current pages favicon inside urlbar (aka location bar, address bar or awesome bar).
// [!] If a page does not offer a favicon, browser default branch icon is shown.
// [!] In a multi-window environment pages without favicons might show wrong icons.
// option: set icon for pages without favicon


var i_icon = 'chrome://global/skin/icons/info.svg';
var sheet1 = 'chrome://global/skin/icons/Portrait.png';
var sheet2 = 'file:///' +
			  Components.classes["@mozilla.org/file/directory_service;1"].getService( Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile).path.replace(/\134/g,'/') +
			  '/chrome/image/tab_favicon_sheet.png';
var brand = 'chrome://branding/content/icon32.png'; //was 'chrome://branding/content/identity-icons-brand.svg'
var globe = 'chrome://global/skin/icons/defaultFavicon.svg'; //was 'chrome://mozapps/skin/places/defaultFavicon.svg'
var warning = 'chrome://global/skin/icons/warning.svg';

var icon_for_pages_without_favicon = sheet2; // i_icon, sheet, globe or brand (colorized Fx channel icon)

var favicon_click_opens_page_info_window = true; // opens page info window on click, if set to true

var id_box = document.getElementById('identity-box');
var id_icon = document.getElementById('identity-icon');

var FaviconInUrlbar = {
init: function() {
	try {

		var favimginurlbar = document.createXULElement("image");
		favimginurlbar.setAttribute("id","favimginurlbar");

		if(favicon_click_opens_page_info_window)
			favimginurlbar.setAttribute("onclick","gIdentityHandler.handleMoreInfoClick(event);");

		favimginurlbar.style.width = "16px";
		favimginurlbar.style.height = "16px";
		favimginurlbar.style.marginLeft = "3px";
		favimginurlbar.style.marginRight = "3px";
		favimginurlbar.style.marginTop = "3px";
		favimginurlbar.style.marginBottom = "3px";
		id_box.appendChild(favimginurlbar);

		if(window.getComputedStyle(id_icon).getPropertyValue('list-style-image').includes('search-glass.svg'))
			id_icon.style.visibility = "collapse";
		else
			id_icon.style.visibility = "visible";

		// update script every time tab attributes get modified (switch/open tabs/windows)
		document.addEventListener("TabAttrModified", updateIcon, false);
		document.addEventListener('TabSelect', updateIcon, false);
		//document.addEventListener('TabOpen', updateIcon, false); test FX 115.7
		document.addEventListener('TabClose', updateIcon, false);
		//document.addEventListener('load', updateIcon, false); test FX 115.7
		//document.addEventListener("DOMContentLoaded", updateIcon, false); test FX 115.7

		function updateIcon() {

			setTimeout(function() { // timeout fixes wrong icon detection in some cases

			if(gBrowser.selectedTab.image == i_icon)
				gBrowser.selectedTab.image = warning;

			// get current tabs favicon
			var favicon_in_urlbar = gBrowser.selectedTab.image;

			// if current tab offers no icon, use selected icon (icon_for_pages_without_favicon)

			if(!gBrowser.selectedTab.image || gBrowser.selectedTab.image == null) {
				if(!icon_for_pages_without_favicon)
					favicon_in_urlbar = brand;
				else
					favicon_in_urlbar = icon_for_pages_without_favicon;
			}

			document.querySelector('#favimginurlbar').style.listStyleImage = "url('"+favicon_in_urlbar+"')";

			if(window.getComputedStyle(id_icon).getPropertyValue('list-style-image').includes('search-glass.svg')/* || window.getComputedStyle(id_icon).getPropertyValue('list-style-image').includes('info.svg)')*/)
				id_icon.style.visibility = "collapse";
			else
				id_icon.style.visibility = "visible";

			},100);

		}

		/* restore icon badge for websites with granted permissions */
		var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"].getService(Components.interfaces.nsIStyleSheetService);
		var uri = Services.io.newURI("data:text/css;charset=utf-8," + encodeURIComponent(' \
			\
			.grantedPermissions::after { \
			  content: "" !important; \
			  display: block !important; \
			  width: 6px !important; \
			  height: 6px !important; \
			  position: absolute !important; \
			  margin-inline-start: 14px !important; \
			  margin-top: 2px !important; \
			  background: Highlight !important; \
			  border-radius: 100px !important; \
			} \
			#identity-permission-box::after { \
			  content: "" !important; \
			  display: block !important; \
			  width: 6px !important; \
			  height: 6px !important; \
			  position: absolute !important; \
			  margin-inline-start: 34px !important; \
			  margin-top: -10px !important; \
			  background: Highlight !important; \
			  border-radius: 100px !important; \
			} \
			\
		'), null, null);

		// remove old style sheet
		if (sss.sheetRegistered(uri,sss.AGENT_SHEET)) sss.unregisterSheet(uri,sss.AGENT_SHEET);

		sss.loadAndRegisterSheet(uri, sss.AGENT_SHEET);

		//execute once at start
		updateIcon();

	} catch(e) {}
}
};

FaviconInUrlbar.init();
