var EXPORTED_SYMBOLS = ["BookitConversion"]

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;

function BookitConversion() {

		this.oBookit2Pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.bookit2.");

        this.oBookit2Pref.QueryInterface(Ci.nsIPrefBranch2);
}

BookitConversion.prototype = {

    _data: null,
    _isURL: false,
    _author: "Bookit",
    _title: "",
    _filename: "",
    _format: "lrf",
    
    //
    // data: either url or html data
    // isURL: true if data is url
    // author:
    // title:
    // filename: filename not including path but including extension
    // format: lrf, epub, mobi    
    performConversion: function(data, isURL, author, title, filename, format) {
         
        this._data = data;
        this._isURL = isURL;
        this._author = author;
        this._title = title;
        this._filename = filename;
        this._format = format;
         
        var doBackground = this.GetBookitPrefBool("enable_threading");
        
        if(doBackground) {
            var background = Components.classes["@mozilla.org/thread-manager;1"].getService().newThread(0);
            background.dispatch(this, background.DISPATCH_NORMAL);
        }
        else {
        
            this.run();
        }
    },
    run: function() {
        try {
        
            var logfile = this.getLogFile();
            LOG(logfile.path);
            var workingDir = this.getWorkingDir();
            LOG(workingDir.path);
        
            var workingFile;
            if(_isURL) {
                workingFile = this.web2Disk(_data);
            }
            else {
                workingFile = this.saveData(_data);
            }
            
            /*

            get output filetype and extension
            create output filename

            convert file

            add to calibre

            launch calibre
            */
            
            workingDir.remove(true);            
     
        } catch(err) {
            Components.utils.reportError(err);
        }
    },
    saveData: function(data) {
    
        // return nsIFile
    },
    web2Disk: function(url) {
    
        // return nsIFile to primary file
    },
    convertLRF: function(source, outputFile) {
        // both are nsIFile
    },
    convertEPub: function(source, outputFile) {
        // both are nsIFile
    },
    convertMobi: function(source, outputFile) {
        // both are nsIFile
    },
    addToCalibre: function(outputFile) {
        // nsIFile
    },
    launchCalibre: function() {
        
    },
    getLogFile: function() {
    
        var logfile = Components.classes["@mozilla.org/file/directory_service;1"]
                        .getService(Components.interfaces.nsIProperties)
                        .get("TmpD", Components.interfaces.nsIFile);
        logfile.append("bookit.log");
        logfile.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
    },
    getWorkingDir: function() {
    
        var logfile = Components.classes["@mozilla.org/file/directory_service;1"]
                        .getService(Components.interfaces.nsIProperties)
                        .get("TmpD", Components.interfaces.nsIFile);
        logfile.append("bookit-work");
        logfile.createUnique(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0666);
    },
    GetBookitPref: function(sName)
    {
        try {return this.oBookit2Pref.getComplexValue(sName, Components.interfaces.nsIPrefLocalizedString).data;}
        catch (e) {}
        return this.oBookit2Pref.getCharPref(sName);
    },

    GetBookitPrefBool: function(sName)
    {
        return this.oBookit2Pref.getBoolPref(sName);
    },
    QueryInterface: function(iid) {
        if (iid.equals(Components.interfaces.nsIRunnable) ||
            iid.equals(Components.interfaces.nsISupports)) {
                return this;
        }
        throw Components.results.NS_ERROR_NO_INTERFACE;
    }
};



function LOG(msg) {
  var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);
  consoleService.logStringMessage(msg);
}