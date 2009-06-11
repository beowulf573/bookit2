/* ---------------------------------------------------------------------- */
/* Component specific code.                                               */

const CLASS_ID = Components.ID('{fa7dc1ea-f875-4831-9618-b33dddc5f63b}');
const CLASS_NAME = 'Execute a set of commands in a single batch/script file';
const CONTRACT_ID = '@heorot.org/bookit-command;1';
const INTERFACE = Components.interfaces.nsIBookitCommand;


const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;

function MyCommand() {
    this.wrappedJSObject = this;
}

MyCommand.prototype = {
		
     executeCommand: function(commands, logfile ) {
     
     // create temp file
     
     // open and write commands
     
     // execute command (blocking) redirecting to log file
     
     // delete temp file
     
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
        var obj = new MyCommand();
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
            throw Components.results.NS_ERROR_FACTORY_REGISTER_AGAIN;
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

