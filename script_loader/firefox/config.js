// config.js
try {

	Cu.importGlobalProperties(['PathUtils']);

	if (!Services.appinfo.inSafeMode) {
		
		Services.scriptloader.loadSubScript(
			PathUtils.toFileURI(PathUtils.join(PathUtils.profileDir,
			'chrome', 'js_stuff', 'userChromeJS.js')), this, "UTF-8"
		);
		
  };
  
} catch(e) {};
