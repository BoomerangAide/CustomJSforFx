var DownloadWindow = null;

var ongoing_downloads_list = [];
var cancelled_downloads_list = [];
var stopped_downloads_list = [];
var successful_downloads_list = [];

var {Services} = Components.utils.import("resource://gre/modules/Services.jsm", {});
var {Downloads} = Components.utils.import("resource://gre/modules/Downloads.jsm", {});

var DownloadWindowObject = {
	
	init: async function() {
	
		try {

			var appversion = parseInt(Services.appinfo.version);
			let download_button = document.getElementById('downloads-button');

			if(download_button && download_button.visibility != "hidden" && download_button.display != "none") {

				download_button.onmousedown =
					function(event) {
						if(!('which' in event) || event.which == 1) {
							if(DownloadWindow == null || DownloadWindow.closed) {
								DownloadWindow = window.open("about:downloads","DownloadsWindow","chrome,dialog=no,all,width=640,height=480,centerscreen,scrollbars=yes,resizable=yes,dependent=yes");
								DownloadWindow.addEventListener("load", setupMoreGUI);
							}
							else
							if(DownloadWindow.windowState == 2) //1 is maximized, 2 is minimized, 3 is normal, 4 is fullscreen
								DownloadWindow.focus();
							else {
								DownloadWindow.close();
							}
						}
						else
						if(event.which  == 3) {		//right-click open both context menu and the default downloads tab
							BrowserDownloadsUI();
						}
						else
						if(event.which == 2) {		//middle-click invoke Retry All
							RetryAllMidClick();
						}
					};

			}
			
			//Code below allow to monitof the session downloads on the download button popup
			//This won't monitor downloads from history since there's a possibility of duplicates
			//causing wrong values to be displayed
			
			let dl_list = await Downloads.getList(Downloads.ALL);
			
			let dl_view_events = {
				
				onDownloadAdded: download => {
					
					if(!download.stopped) {
						ongoing_downloads_list.push(download);
					}
					else
					if(download.succeeded) {
						successful_downloads_list.push(download);
					}
					else
					if(download.canceled ) {
						cancelled_downloads_list.push(download);
					}
					else {
						stopped_downloads_list.push(download);
					}
					
					try {
						document.getElementById('downloads-button').setAttribute("tooltiptext",
						"Ongoing downloads: " + ongoing_downloads_list.length + '\r\n' +
						"Successful downloads: " + successful_downloads_list.length	+ '\r\n' +					
						"Stopped downloads: " + stopped_downloads_list.length + '\r\n' +
						"Cancelled downloads: " + cancelled_downloads_list.length);				
					}
					catch(e) {}
						
				},
				
				onDownloadChanged: download => {
					
					let index = ongoing_downloads_list.indexOf(download);
					if(index != -1)
						ongoing_downloads_list.splice(index,1);
					
					index = cancelled_downloads_list.indexOf(download);
					if(index != -1)
						cancelled_downloads_list.splice(index,1);
										
					index = stopped_downloads_list.indexOf(download);
					if(index != -1)
						stopped_downloads_list.splice(index,1);
										
					index = successful_downloads_list.indexOf(download);
					if(index != -1)
						successful_downloads_list.splice(index,1);
					
					if(download.succeeded) {
						successful_downloads_list.push(download);
					}
					else
					if(download.canceled ) {
						cancelled_downloads_list.push(download);
					}
					else
					if(!download.stopped) {
						ongoing_downloads_list.push(download);
					}
					else {
						stopped_downloads_list.push(download);
					}
					
					try {
						document.getElementById('downloads-button').setAttribute("tooltiptext",
						"Ongoing downloads: " + ongoing_downloads_list.length + '\r\n' +
						"Successful downloads: " + successful_downloads_list.length	+ '\r\n' +					
						"Stopped downloads: " + stopped_downloads_list.length + '\r\n' +
						"Cancelled downloads: " + cancelled_downloads_list.length);						
					}
					catch(e) {}
					
				},
				
				onDownloadRemoved: download => {
					
					let index = ongoing_downloads_list.indexOf(download);
					if(index != -1)
						ongoing_downloads_list.splice(index,1);
					
					index = cancelled_downloads_list.indexOf(download);
					if(index != -1)
						cancelled_downloads_list.splice(index,1);
										
					index = stopped_downloads_list.indexOf(download);
					if(index != -1)
						stopped_downloads_list.splice(index,1);
										
					index = successful_downloads_list.indexOf(download);
					if(index != -1)
						successful_downloads_list.splice(index,1);
					
					if(
						ongoing_downloads_list.length != 0 ||
						cancelled_downloads_list.length != 0 ||
						stopped_downloads_list.length != 0 ||
						successful_downloads_list.length != 0
					)
					{
						try {
							document.getElementById('downloads-button').setAttribute("tooltiptext",
						"Ongoing downloads: " + ongoing_downloads_list.length + '\r\n' +
						"Successful downloads: " + successful_downloads_list.length	+ '\r\n' +					
						"Stopped downloads: " + stopped_downloads_list.length + '\r\n' +
						"Cancelled downloads: " + cancelled_downloads_list.length);	
						} catch(e) {}
					}
					else
						try {
							document.getElementById('downloads-button').setAttribute("tooltiptext", GetDynamicShortcutTooltipText('downloads-button'));
						} catch(e) {}
					
				}
			};
			
			dl_list.addView(dl_view_events);

		}
		catch(e) { console.log("download_button_open_list_directly.js:"); console.log(e); }

		function setupMoreGUI(ev) {
			
			var stack;
			
			try {
				stack = DownloadWindow.document.getElementsByTagName("stack")[0];
			}
			catch(exc) {
				stack = null;
			}
			
			var bottom_box = document.createXULElement("box");
			
			var div_container = document.createElement("div");
			div_container.setAttribute("style","max-height:480px;");
			
			var clear_button = document.createElement("button");
			clear_button.setAttribute("align", "center");
			clear_button.append("Clear successful downloads");
			
			var retry_all_button = document.createElement("button");
			retry_all_button.setAttribute("align", "center");
			retry_all_button.append("Retry All");
			
			bottom_box.append(clear_button);
			bottom_box.append(retry_all_button);
			bottom_box.setAttribute("style","background-color: #F0F0F0;");
			bottom_box.setAttribute("flex","0");
			
			if(stack == null)
			{
				
				stack = document.createXULElement("stack");
				stack.setAttribute("flex","1");
				
				DownloadWindow.document.lastChild.insertBefore(stack,DownloadWindow.document.getElementById("downloadsRichListBox"));
				
				stack.append(DownloadWindow.document.getElementById("downloadsRichListBox"));
				stack.append(DownloadWindow.document.getElementById("downloadsListEmptyDescription"));
				
			}
			
			stack.after(bottom_box);
			
			DownloadWindow.document.getElementById("downloadsRichListBox").setAttribute("style","max-height:480px;");
			
			DownloadWindow.removeEventListener('DOMContentLoaded',setupMoreGUI);
			DownloadWindow.onresize = function(event) {
				
				if((DownloadWindow.outerHeight > 3 * window.screen.availHeight / 4) && (stack.nextSibling == bottom_box)) {
					stack.before(bottom_box);
				}
				else
				if((DownloadWindow.outerHeight <= 3 * window.screen.availHeight / 4) && (stack.nextSibling != bottom_box)) {
					stack.after(bottom_box);
				}
				
			};
			
			clear_button.onclick = 
				/// Cannot clear downloads from history unless version 70+
				async function ClearSuccessfulDownloads() {
					
					var downloads_list_global = await Downloads.getList(Downloads.ALL);
					var downloads_list = await downloads_list_global.getAll();
					var i;
					let download_button = document.getElementById('downloads-button');
					
					if(appversion > 69) {
						
						Components.utils.import("resource://gre/modules/DownloadHistory.jsm");
						
						var downloads_history_list_global = await DownloadHistory.getList(Downloads.ALL);
						var downloads_history_list = await downloads_history_list_global.getAll();

						for(i = 0; i < downloads_history_list.length; i++) {
							if(downloads_history_list[i].succeeded) {
								try { await PlacesUtils.history.remove(downloads_history_list[i].source.url); } catch (e) {}
								await downloads_history_list[i].finalize(true);		
							}
						}
						
					}
					
					for(i = 0; i < downloads_list.length; i++) {
						if(downloads_list[i].succeeded) {
							try { await PlacesUtils.history.remove(downloads_history_list[i].source.url); } catch (e) {}
							await downloads_list_global.remove(downloads_list[i]);
							await downloads_list[i].finalize(true);
						}
					}
					
					if(download_button.hasAttribute('attention')) {
						download_button.removeAttribute('attention');
					}		
					
				};
			
			retry_all_button.onclick = 
				/// Cannot retry downloads from history unless version 70+
				async function RetryAll() {
					
					var i;
					var item_to_retry = null;
					let download_button = document.getElementById('downloads-button');
					
					try {
						
						var downloads_list_global = await Downloads.getList(Downloads.ALL);
						var downloads_list = await downloads_list_global.getAll();
						
						for(i = 0; item_to_retry === null && i < downloads_list.length; i++) {
							if(downloads_list[i].stopped && !downloads_list[i].succeeded && !downloads_list[i].canceled) {
								item_to_retry = downloads_list[i];
							}
						}
						
						if(item_to_retry === null && appversion > 69) {
							
							Components.utils.import("resource://gre/modules/DownloadHistory.jsm");
							
							var downloads_history_list_global = await DownloadHistory.getList(Downloads.ALL);
							var downloads_history_list = await downloads_history_list_global.getAll();

							for(i = 0; item_to_retry === null && i < downloads_history_list.length; i++) {
								if(downloads_history_list[i].stopped && !downloads_history_list[i].succeeded && !downloads_history_list[i].canceled) {	
									item_to_retry = downloads_history_list[i];						
								}
							}
						
						}
						
						if(item_to_retry !== null) {
							try { await item_to_retry.start(); } catch(e) {}
							setTimeout(retry_all_button.onclick,1000);
						}
						else
						if(download_button.hasAttribute('attention')) {
							download_button.removeAttribute('attention');
						}
						
					}
					catch(e) {
						setTimeout(retry_all_button.onclick,1000);
					}
					
				};
			
		}

		/// Cannot retry downloads from history unless version 70+
		async function RetryAllMidClick() {
			
			var i;
			var item_to_retry = null;
			let download_button = document.getElementById('downloads-button');
			
			try {
				
				var downloads_list_global = await Downloads.getList(Downloads.ALL);
				var downloads_list = await downloads_list_global.getAll();
				
				for(i = 0; item_to_retry === null && i < downloads_list.length; i++) {
					if(downloads_list[i].stopped && !downloads_list[i].succeeded && !downloads_list[i].canceled) {
						item_to_retry = downloads_list[i];
					}
				}
				
				if(item_to_retry === null && appversion > 69) {
					
					Components.utils.import("resource://gre/modules/DownloadHistory.jsm");
					
					var downloads_history_list_global = await DownloadHistory.getList(Downloads.ALL);
					var downloads_history_list = await downloads_history_list_global.getAll();

					for(i = 0; item_to_retry === null && i < downloads_history_list.length; i++) {
						if(downloads_history_list[i].stopped && !downloads_history_list[i].succeeded && !downloads_history_list[i].canceled) {	
							item_to_retry = downloads_history_list[i];						
						}
					}
				
				}
				
				if(item_to_retry !== null) {
					try { await item_to_retry.start(); } catch(e) {}
					setTimeout(RetryAllMidClick,1000);
				}
				else
				if(download_button.hasAttribute('attention')) {
					download_button.removeAttribute('attention');
				}
				
			}
			catch(e) {
				setTimeout(RetryAllMidClick,1000);
			}
			
		};
	}
	
}

DownloadWindowObject.init();
