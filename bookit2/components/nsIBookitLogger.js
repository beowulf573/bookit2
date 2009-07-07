/* ---------------------------------------------------------------------- */
/* Component specific code.                                               */

const CLASS_ID = Components.ID('{21bd5c5b-5159-4306-95bd-0852c8d3a750}');
const CLASS_NAME = 'Bookit Logger';
const CONTRACT_ID = '@heorot.org/bookit-logger;1';
const INTERFACE = Components.interfaces.nsIBookitLogger;


const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;

function MyBookitLogger() {
    this.wrappedJSObject = this;
    this.consoleService = Cc['@mozilla.org/consoleservice;1'].getService(Ci.nsIConsoleService);
}

MyBookitLogger.prototype = {
    
    
    logError: function( msg ) {
      var errorObject = Cc['@mozilla.org/scripterror;1'].createInstance(Ci.nsIScriptError);
      if (this.consoleService && errorObject) {
        errorObject.init("Bookit: " + msg, "", "", 0, 0, 0, "");
        this.consoleService.logMessage(errorObject);
      }
        
    },
    
    logInfo: function( msg ) {
        if(this.consoleService) {
            this.consoleService.logStringMessage("Bookit: " + msg);
        }
    },
    
    logWarn: function( msg ) {
        
      var errorObject = Cc['@mozilla.org/scripterror;1'].createInstance(Ci.nsIScriptError);
      if (this.consoleService && errorObject) {
        errorObject.init("Bookit: " + msg, "", "", 0, 0, 1, "");
        this.consoleService.logMessage(errorObject);
      }
    },

    notifyObservers: function(aSubject, aTopic, aData ) {
    
        var observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
        observerService.notifyObservers(aSubject, aTopic, aData);
    },

    QueryInterface: function(aIID) {
        if(!aIID.equals(INTERFACE) &&
           !aIID.equals(Ci.nsISupports))
            throw Cr.NS_ERROR_NO_INTERFACE;
        return this;
    }
};

var Factory = {	
    createInstance: function(aOuter, aIID) {
        if(aOuter != null)
            throw Cr.NS_ERROR_NO_AGGREGATION;
		
		var obj = new MyBookitLogger();
		if(typeof(obj.init) == 'function')
			obj.init();
		
        return obj.QueryInterface(aIID);
    }
};

var Module = {
    _firstTime: true,

    registerSelf: function(aCompMgr, aFileSpec, aLocation, aType) {
        if (this._firstTime) {
            this._firstTime = false;
            throw Cr.NS_ERROR_FACTORY_REGISTER_AGAIN;
        };
        aCompMgr = aCompMgr.QueryInterface(Ci.nsIComponentRegistrar);
        aCompMgr.registerFactoryLocation(
            CLASS_ID, CLASS_NAME, CONTRACT_ID, aFileSpec, aLocation, aType);
    },

    unregisterSelf: function(aCompMgr, aLocation, aType) {
        aCompMgr = aCompMgr.QueryInterface(Ci.nsIComponentRegistrar);
        aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);
    },

    getClassObject: function(aCompMgr, aCID, aIID) {
        if (!aIID.equals(Ci.nsIFactory))
            throw Cr.NS_ERROR_NOT_IMPLEMENTED;

        if (aCID.equals(CLASS_ID))
            return Factory;

        throw Cr.NS_ERROR_NO_INTERFACE;        
    },

    canUnload: function(aCompMgr) { return true; }
};

function NSGetModule(aCompMgr, aFileSpec) { return Module; }

