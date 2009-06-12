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
		
     executeCommand: function(logfile, commands) {
        
        // create temp file
        var basename = this.getBaseFilename();
        var file = Components.classes["@mozilla.org/file/directory_service;1"]
            .getService(Components.interfaces.nsIProperties)
            .get("TmpD", Components.interfaces.nsIFile);
        file.append(basename);
        file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
     
        // open and write commands
	    // file is nsIFile, data is a string
        var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
					.createInstance(Components.interfaces.nsIFileOutputStream);

		// use 0x02 | 0x10 to open file for appending.
		fos.init(file, 0x02 | 0x08 | 0x20, 0666, 0); 
	 
		var charset = "UTF-8"; // Can be any character encoding name that Mozilla supports

		var os = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
					.createInstance(Components.interfaces.nsIConverterOutputStream);

		// This assumes that fos is the nsIOutputStream you want to write to
		os.init(fos, charset, 0, 0x0000);

        this.printPreScript(os);
        
		var enumerator = commands.enumerate();
        while(enumerator.hasMoreElements()) {
        
            var line = enumerator.getNext().QueryInterface(Ci.nsIVariant);
            //var line = enumerator.getNext().toString();
            // LOG("line: " + line);
            // TODO: do we need \r\n for windows?
            os.writeString(line + "\n");
        }
        
	    os.close();
	    fos.close();
        
        // execute command (blocking) redirecting to log file
        this.executeFile(file, logfile);
        
        // delete temp file
		//LOG(file.path);
        file.remove(false);
     },   

    printPreScript: function(os) {
    
        var osString = Components.classes["@mozilla.org/xre/app-info;1"]
                          .getService(Components.interfaces.nsIXULRuntime).OS;

        if(osString == "WINNT") {
            os.writeString("@echo off\n");
        }
        else
        if(osString == "Linux") {
            os.writeString("#!/bin/sh\n");
	    }
	    else
		if(osString == "Darwin") {
		    os.writeString("#!/bin/sh\n");
		}
    },
    executeFile: function( scriptFile, logfile ) {
    
        var osString = Components.classes["@mozilla.org/xre/app-info;1"]
                          .getService(Components.interfaces.nsIXULRuntime).OS;

        if(osString == "WINNT") {
            this.executeWindowsCmd(scriptFile, logfile);
        }
        else
        if(osString == "Linux") {
            this.executeUnixScript(scriptFile, logfile);
	    }
	    else
		if(osString == "Darwin") {
		    this.executeUnixScript(scriptFile, logfile);
		}
    },
    executeUnixScript: function( scriptFile, logfile ) {
        // use /bin/sh for exe,  file as parameter, redirect to logfile
        
        // TODO:
    
    },
    executeWindowsCmd: function( scriptFile, logfile ) {
        // use runhidden.exe for exe, file and logfile as parameters
        var ext_id = "bookit2@heorot.org";
        var em = Components.classes["@mozilla.org/extensions/manager;1"].
								getService(Components.interfaces.nsIExtensionManager);
        // the path may use forward slash ("/") as the delimiter
       
        var installL = em.getInstallLocation(ext_id);

        var runhidden = installL.getItemFile(ext_id, "platform/WINNT/runhidden.exe");
    
		var parameters = [ scriptFile.path , logfile ];
		
	    // create an nsIProcess
	    var process = Components.classes["@mozilla.org/process/util;1"]
						.createInstance(Components.interfaces.nsIProcess);
       
	    process.init(runhidden);
 	
	    // Run the process.
	    // If first param is true, calling thread will be blocked until
	    // called process terminates.
	    // Second and third params are used to pass command-line arguments
	    // to the process.
       	    
	    process.run(true, parameters, parameters.length); 
    },
    getBaseFilename: function()  {

        var osString = Components.classes["@mozilla.org/xre/app-info;1"]
                          .getService(Components.interfaces.nsIXULRuntime).OS;

        if(osString == "WINNT") {
            return "bookit.cmd";
        }
        else
        if(osString == "Linux") {
            return "bookit.sh";
	    }
	    else
		if(osString == "Darwin") {
		    return "bookit.sh";
		}
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

function LOG(msg) {

  var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);
  consoleService.logStringMessage(msg);
}