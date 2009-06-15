var EXPORTED_SYMBOLS = ["BookitConversion"]

Components.utils.import("resource://bookit2/BookitCommand.js");

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;

String.prototype.format = function()
{
var pattern = /\{\d+\}/g;
var args = arguments;
return this.replace(pattern, function(capture){ return args[capture.match(/\d+/)]; });
}

function BookitConversion() {

		this.oBookit2Pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.bookit2.");

        this.oBookit2Pref.QueryInterface(Ci.nsIPrefBranch2);
        
        var loggerObj = Cc["@heorot.org/bookit-logger;1"].createInstance(Ci.nsIBookitLogger);

        // create proxy of logger object for use when threading
        var threadManager = Cc["@mozilla.org/thread-manager;1"].getService(Ci.nsIThreadManager);
        var thread = threadManager.mainThread;
  
        // Creates a proxy for this object that will make calls on the UI event queue.
        var nsIPOM = Ci.nsIProxyObjectManager;
        var proxyManager = Cc["@mozilla.org/xpcomproxy;1"].getService(Ci.nsIProxyObjectManager);
        this._loggerProxy = proxyManager.getProxyForObject(thread, 
                                             Ci.nsIBookitLogger, 
                                             loggerObj, 
                                             Ci.nsIProxyObjectManager.INVOKE_SYNC
                                              + Ci.nsIProxyObjectManager.FORCE_PROXY_CREATION);
}

BookitConversion.prototype = {

    _data: null,
    _isURL: false,
    _author: "Bookit",
    _title: "",
    _filename: "",
    
	// TODO: rename these
	doConversion: function(window, data, isURL, author, title) {
    
	// some characters screwup the meta data
	// replace all quote variants with single quote
    var re = /[\u0022\u0027\u0060\u00B4\u2018\u2019\u201C\u201D]/gi;
    
	title = title.replace(re, "'");    

    re = /[\~\':|\\\?\*<\">\+\[\]/]/g;            
    
    var filename = title.replace(re, "_");
    
    if(filename.length > 63) {
        filename = filename.substr(0,63);	
    }
    
    var format = this.GetBookitPref("output_format");
    if(filename == null || filename.length == 0) {
    	filename = this.GetBookitPref("default_filename");
    }	
    if(title == null || title.length == 0) {
    	title = this.GetBookitPref("default_title");
    }
    if(author == null || author.length == 0) {
	author = this.GetBookitPref("default_author");
    }
    if(this.GetBookitPrefBool("show_options_dlg")) {
    
        var params = {
            inn: {
                title: title,
                author: author,
                format: format,
                filename: filename
            },
            out: {
                title: null,
                author: null,
                format: null,
                filename: null,
                result: false
            }
        };
      
        window.openDialog(
               "chrome://bookit2/content/precreate.xul",
               "",
               "centerscreen,dialog=no,chrome,dependent,modal",
               params
               );
        if(params.out.result) {
        
            title = params.out.title;
            author = params.out.author;
            filename = params.out.filename;
            
            // TODO: check for extension
			filename = (filename == null || filename.length == 0 ? "bookit" : filename);
            filename = filename + "." + params.out.format;
        }
        else {
            return;
        }
    } 
    else {
        // attach default extension to filename
		filename = (filename == null || filename.length == 0 ? "bookit" : filename);
        filename = filename + "." + format;
    }

    this.performConversion(data, isURL, author, title, filename);        
  },

    //
    // data: either url or html data
    // isURL: true if data is url
    // author:
    // title:
    // filename: filename not including path but including extension
    // format: lrf, epub, mobi    
    performConversion: function(data, isURL, author, title, filename) {
         
        this._data = data;
        this._isURL = isURL;
        this._author = author;
        this._title = title;
        this._filename = filename;
         
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
            //LOG(logfile.path);            
            var workingDir = this.getWorkingDir();
            //LOG(workingDir.path);
        
            var workingFile;
            if(this._isURL) {
                workingFile = this.web2Disk(workingDir, this._data, logfile);
            }
            else {
                workingFile = this.saveData(workingDir, this._data, logfile);
            }
            
            var outputFile = this.getOutputFile();
            
            var useEbookConvert = this.GetBookitPrefBool("use_ebook_convert");
			if(useEbookConvert) {
			    this.eBookConvert(workingFile, outputFile, logfile);
			}
			else
            if(outputFile.path.match(/\.lrf$/i)) {
                this.convertLRF(workingFile, outputFile, logfile);
            }
            else
            if(outputFile.path.match(/\.epub$/i)) {
                this.convertEPub(workingFile, outputFile, logfile);                
            }
            else
            if(outputFile.path.match(/\.mobi$/i)) {
                this.convertMobi(workingFile, outputFile, logfile);                
            }
            
            var doAddCalibre = this.GetBookitPrefBool("add_calibre");
            var doLaunchCalibre = this.GetBookitPrefBool("launch_calibre");
            
            if(doAddCalibre) {
                this.addToCalibre(outputFile, logfile);
            }
            
            if(doLaunchCalibre) {
                this.launchCalibre();
            }
            
            workingDir.remove(true);
			
			// TODO: temp code until job window is done
			this.SetBookitPref("last_logfile", logfile.path);
     
        } catch(err) {
			// TODO:
			//Components.utils.reportError(err);
        }
    },
    saveData: function(workingDir, data, logfile) {
    
        var file = workingDir.clone();
        file.append("index.html");
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

		os.writeString("<html><body>\n");
        os.writeString(data);
        os.writeString("\n");
		os.writeString("</body></html>\n");
        
	    os.close();
	    fos.close();
        
        // return nsIFile
        return file;
    },
    web2Disk: function(workingDir, url, logfile) {
        
        var maxRecursions = this.GetBookitPrefInt("spidering.max_recursions");
        var maxFile = this.GetBookitPrefInt("spidering.max_files");
        var delay = this.GetBookitPrefInt("spidering.delay");
        var exePath = this.GetBookitPref("paths.web2disk");
        
        var command = "\"" + exePath + "\" -r " + maxRecursions + " --delay=" + delay + " -d \"" + workingDir.path + "\" ";
        
        if(maxFile != 0) {
        
            command = command + " -n " + maxFile + " ";
        }
        
        command = command + "\"" + url + "\"";
        
        var lines = [ command ];            
    
        var cmd = new BookitCommand();
    
        cmd.executeCommand(logfile.path, lines);
         
        return this.findFirstFile(workingDir);        
    },
    findFirstFile: function(workingDir) {
    
        var entries = workingDir.directoryEntries;
        while(entries.hasMoreElements()) {

            var subFile = entries.getNext(); 
            subFile.QueryInterface(Ci.nsIFile);

            if(subFile.isFile()) {
                return subFile;
            }            
        }         
        return null;
    },
    convertLRF: function(source, outputFile, logfile) {
        
        var left_margin = this.GetBookitPrefInt("layout.left_margin");
        var right_margin = this.GetBookitPrefInt("layout.right_margin");
        var top_margin = this.GetBookitPrefInt("layout.top_margin");
        var bottom_margin = this.GetBookitPrefInt("layout.bottom_margin");
        var base_font_size = this.GetBookitPrefInt("layout.base_font_size");
        var ignore_tables = this.GetBookitPrefBool("lrf.ignore_tables");
        var useHeader = this.GetBookitPrefBool("lrf.header");
        var headerFormat = this.GetBookitPref("lrf.header_format");
        var html2lrf = this.GetBookitPref("paths.html2lrf");
        
        // both are nsIFile
        var command = "\"{0}\" -o \"{1}\" {2} -t \"{3}\" -a \"{4}\" --base-font-size={5} {6} {7} --left-margin {8} --right-margin {9} --top-margin {10} --bottom-margin {11} \"{12}\"".format(html2lrf,
                                        outputFile.path,
                                        ignore_tables ? "--ignore-tables" : "",
                                        this._title,
                                        this._author,
                                        base_font_size,
                                        useHeader ? "--header" : "",
                                        useHeader && headerFormat && headerFormat.length != 0 ? "--headerformat " + headerFormat : "",
                                        left_margin, right_margin, top_margin, bottom_margin,                                        
                                        source.path);
                                        
        //LOG("cmd: " + command);
        
        var lines = [ command ];            
    
        var cmd = new BookitCommand();
    
        cmd.executeCommand(logfile.path, lines);        
    },
    convertEPub: function(source, outputFile, logfile) {
        var left_margin = this.GetBookitPrefInt("layout.left_margin");
        var right_margin = this.GetBookitPrefInt("layout.right_margin");
        var top_margin = this.GetBookitPrefInt("layout.top_margin");
        var bottom_margin = this.GetBookitPrefInt("layout.bottom_margin");
        var base_font_size = this.GetBookitPrefInt("layout.base_font_size");
        var html2epub = this.GetBookitPref("paths.html2epub");
        
        // both are nsIFile
        var command = "\"{0}\" -o \"{1}\" -t \"{2}\" -a \"{3}\" --base-font-size={4} --margin-left {5} --margin-right {6} --margin-top {7} --margin-bottom {8} \"{9}\"".format(html2epub,
                                        outputFile.path,
                                        this._title,
                                        this._author,
                                        base_font_size,
                                        left_margin, right_margin, top_margin, bottom_margin,
                                        source.path);
                                        
        //LOG("cmd: " + command);
        
        var lines = [ command ];            
    
        var cmd = new BookitCommand();
    
        cmd.executeCommand(logfile.path, lines);        
    },
    convertMobi: function(source, outputFile, logfile) {
        var left_margin = this.GetBookitPrefInt("layout.left_margin");
        var right_margin = this.GetBookitPrefInt("layout.right_margin");
        var top_margin = this.GetBookitPrefInt("layout.top_margin");
        var bottom_margin = this.GetBookitPrefInt("layout.bottom_margin");
        var base_font_size = this.GetBookitPrefInt("layout.base_font_size");
        var ignore_tables = this.GetBookitPrefBool("mobi.ignore_tables");

        var any2mobi = this.GetBookitPref("paths.any2mobi");
        
        // both are nsIFile
        var command = "\"{0}\" -o \"{1}\" -t \"{2}\" -a \"{3}\" --base-font-size={4} --margin-left {5} --margin-right {6} --margin-top {7} --margin-bottom {8} {9} \"{10}\"".format(any2mobi,
                                        outputFile.path,
                                        this._title,
                                        this._author,
                                        base_font_size,
                                        left_margin, right_margin, top_margin, bottom_margin,
                                        ignore_tables ? "--ignore-tables" : "",
                                        source.path);
                                        
        //LOG("cmd: " + command);
        
        var lines = [ command ];            
    
        var cmd = new BookitCommand();
    
        cmd.executeCommand(logfile.path, lines);        
    },
    eBookConvert: function(source, outputFile, logfile) {
	
	    var left_margin = this.GetBookitPrefInt("layout.left_margin");
        var right_margin = this.GetBookitPrefInt("layout.right_margin");
        var top_margin = this.GetBookitPrefInt("layout.top_margin");
        var bottom_margin = this.GetBookitPrefInt("layout.bottom_margin");
        var outputProfile = this.GetBookitPref("ebook_convert.output_profile");
        var ebook_convert = this.GetBookitPref("paths.ebook_convert");
        
        // both are nsIFile
        var command = "\"{0}\" \"{1}\" \"{2}\" --title=\"{3}\" --authors=\"{4}\" --output-profile={5}".format(
										ebook_convert,
										source.path,
                                        outputFile.path,
                                        this._title,
                                        this._author,
                                        outputProfile
                                        );
                                        
        //LOG("cmd: " + command);
        
        var lines = [ command ];            
    
        var cmd = new BookitCommand();
    
        cmd.executeCommand(logfile.path, lines);        

    },
	
    addToCalibre: function(outputFile, logfile) {
        // nsIFile
        var calibredb = this.GetBookitPref("paths.calibredb");
        
        var command = "\"{0}\" add \"{1}\"".format(calibredb, outputFile.path);
        
        var lines = [ command ];            
    
        var cmd = new BookitCommand();
    
        cmd.executeCommand(logfile.path, lines);        
    },
    launchCalibre: function() {
        
        // launch and forget
        var calibre = this.GetBookitPref("paths.calibre");

        var file = Components.classes["@mozilla.org/file/local;1"]
                .createInstance(Components.interfaces.nsILocalFile);

        file.initWithPath(calibre);

        var parameters = [  ];
	    
        // create an nsIProcess
	    var process = Components.classes["@mozilla.org/process/util;1"]
						.createInstance(Components.interfaces.nsIProcess);
       
	    process.init(file);
 	
	    // Run the process.
	    // If first param is true, calling thread will be blocked until
	    // called process terminates.
	    // Second and third params are used to pass command-line arguments
	    // to the process.
       	    
	    process.run(false, parameters, parameters.length);     
        
    },
    getOutputFile: function() {

        var outputFile;
        var outputPath = this.GetBookitPref("output_directory");
        if(outputPath == null || outputPath.length == 0) {
        
            outputFile = Components.classes["@mozilla.org/file/directory_service;1"]
                            .getService(Components.interfaces.nsIProperties)
                            .get("TmpD", Components.interfaces.nsIFile);
                        
        }
        else {
        
            outputFile = Components.classes["@mozilla.org/file/local;1"]
                        .createInstance(Components.interfaces.nsILocalFile);

            outputFile.initWithPath(outputPath);
        }
        
        outputFile.append(this._filename);        
        outputFile.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, 0666);
        
        return outputFile;
    },
    getLogFile: function() {
    
        var logfile = Components.classes["@mozilla.org/file/directory_service;1"]
                        .getService(Components.interfaces.nsIProperties)
                        .get("TmpD", Components.interfaces.nsIFile);
        logfile.append("bookit.log");
        logfile.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
        return logfile;
    },
    getWorkingDir: function() {
    
        var workingDir = Components.classes["@mozilla.org/file/directory_service;1"]
                        .getService(Components.interfaces.nsIProperties)
                        .get("TmpD", Components.interfaces.nsIFile);
        workingDir.append("bookit-work");
        workingDir.createUnique(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0666);
        return workingDir;
    },
	SetBookitPref: function(sName, sData)
	{
		var oPLS = Components.classes["@mozilla.org/pref-localizedstring;1"].createInstance(Components.interfaces.nsIPrefLocalizedString);
		oPLS.data = sData;
		this.oBookit2Pref.setComplexValue(sName, Components.interfaces.nsIPrefLocalizedString, oPLS);
	},
    GetBookitPref: function(sName)
    {
        try {return this.oBookit2Pref.getComplexValue(sName, Components.interfaces.nsIPrefLocalizedString).data;}
        catch (e) {}
        return this.oBookit2Pref.getCharPref(sName);
    },
    GetBookitPrefInt: function(sName)
    {
        return this.oBookit2Pref.getIntPref(sName);
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