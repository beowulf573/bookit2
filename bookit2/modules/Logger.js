var EXPORTED_SYMBOLS = ["Logger"]


const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;


function Logger() {

	    oBookit2Pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.bookit2.");

        oBookit2Pref.QueryInterface(Ci.nsIPrefBranch2);
        
		this._level = oBookit2Pref.getIntPref("logging.level");
		
        var loggerObj = Cc["@heorot.org/bookit-logger;1"].createInstance(Ci.nsIBookitLogger);

        // create proxy of logger object for use when threading
        var mainThread = Cc["@mozilla.org/thread-manager;1"].getService().mainThread;
        var proxyMgr = Cc["@mozilla.org/xpcomproxy;1"].getService(Ci.nsIProxyObjectManager);

        this._loggerProxy = proxyMgr.getProxyForObject(thread, 
                                             Ci.nsIBookitLogger, 
                                             loggerObj, 
                                             Ci.nsIProxyObjectManager.INVOKE_SYNC
                                              + Ci.nsIProxyObjectManager.FORCE_PROXY_CREATION);
}

Logger.prototype = {
	
	get level() {
		return this._level;
	},
	
	set level(aValue) {
		this._level = aValue;
	},
	logError: function( msg ) {
		if(this._level >= 1) {
			this._loggerProxy.logError(msg);
		}
	},
    
    logWarn: function( msg ) {
		if(this._level >= 2) {
			this._loggerProxy.logWarn(msg);
		}
    },
    
    logInfo: function( msg ) {
		if(this._level >= 3) {
			this._loggerProxy.logInfo(msg);
		}        
    },
    
};



