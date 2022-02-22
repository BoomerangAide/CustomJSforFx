// userChrome.js

function load_js_script(js_file_name) {
	userChrome.import("/js_stuff/" + js_file_name, "UChrm");
}

try {
	load_js_script("others_customizations.js");
	load_js_script("download_button_open_list_directly.js");
	load_js_script("favicon_in_urlbar.uc.js");
	load_js_script("restart_item_in_menu.uc.js");
	load_js_script("space_and_separator_restorer.uc.js");
	load_js_script("alternative_searchbar.uc.js");
	load_js_script("password_manager_button.uc.js");
}
catch(exc) {
	console.log("Exception in userChrome.js");
	console.log(exc);
}

// load other scripts
// load_js_script("my_other_script_name.uc.js");
