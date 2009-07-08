const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function DatabaseManager() { }

DatabaseManager.prototype = {
  classDescription: "Manage our local db",
  classID:          Components.ID("{f4510d47-f0ff-4c45-b673-266d898d9840}"),
  contractID:       "@heorot.org/bookit-dbmanager;1",
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIDatabaseManager]),
    _mDBConn: null,
  
	open: function() {
        // TODO: move id to common code
        var ext_id = "{950a782d-e82f-45e2-9da7-44898356813d}";
        var em = Cc["@mozilla.org/extensions/manager;1"].
								getService(Ci.nsIExtensionManager);
        
        var installL = em.getInstallLocation(ext_id);

        var file = installL.getItemFile(ext_id, "bookit2.sqlite");
       
        var storageService = Cc["@mozilla.org/storage/service;1"]  
                                    .getService(Ci.mozIStorageService);  
        this._mDBConn = storageService.openDatabase(file); 
    },
    
	close: function() {
        if(this._mDBConn != null) {
        
            this._mDBConn.close();
            this._mDBConn = null;
        }
    },
    
	newJob: function(title) {
        if(this._mDBConn != null) {
            var statement = this._mDBConn.createStatement("INSERT INTO jobs (title, state, error, percent_done) VALUES (:title, \"initializing\", 0, 0);");
            statement.params.title = title;
    
            statement.executeStep();
            statement.finalize();
            var id = this._mDBConn.lastInsertRowID.toString();            
            return id;
        }
        return "";
    },
    
	updateJob: function(id, state, error, percent_done) {
        if(this._mDBConn != null) {
            var statement = this._mDBConn.createStatement("UPDATE jobs SET state=:state, error=:error, percent_done=:percent_done WHERE ROWID=:rowid");
            statement.params.state = state;
            statement.params.error = error;
            statement.params.percent_done = percent_done;
            statement.params.rowid = id;
        
            statement.executeStep();
            statement.finalize();            
        }
    },
    
	completeJob: function(id, state, error, log, path) {
        if(this._mDBConn != null) {
            var statement = this._mDBConn.createStatement("UPDATE jobs SET state=:state, error=:error, percent_done=100,log=:log,path=:path WHERE ROWID=:rowid");
            
			statement.params.state = state;
            statement.params.error = error;
            statement.params.log = log;
            statement.params.path = path;
            statement.params.rowid = id;
        
            statement.executeStep();
            statement.finalize();            
        }
    },
    
	deleteJob: function(id) {
        if(this._mDBConn != null) {
            var statement = this._mDBConn.createStatement("DELETE FROM jobs WHERE ROWID=:rowid");
            
		    statement.params.rowid = id;
        
            statement.executeStep();
            statement.finalize();            
        }
    },
	
    getJob: function(id) {
    
        var result = null;
        if(this._mDBConn != null) {
        
            var statement = this._mDBConn.createStatement("SELECT title,state,error,percent_done,path FROM jobs WHERE ROWID=:rowid");
            
	        statement.params.rowid = id;
        
            if(statement.executeStep()) {
			
                result = Cc["@heorot.org/bookit-job;1"].createInstance(Ci.nsIDatabaseJob);  
                
				result.title = statement.row.title;
				result.state = statement.row.state;
				result.error = statement.row.error;
				result.percent_done = statement.row.percent_done;
				result.path = statement.row.path;				
			}
            statement.finalize();
        }
		
		return result;
    },
	
    getLogContents: function(id) {
    		var results = "";
        if(this._mDBConn != null) {
            var statement = this._mDBConn.createStatement("SELECT log FROM jobs WHERE ROWID=:rowid");
            
	        statement.params.rowid = id;
        
            if(statement.executeStep()) {
			
				results = statement.row.log;
			}
			statement.finalize();
        }
		
		return results;
    },
	
    getJobs: function(count) {
        var results = [];
        
            if(this._mDBConn != null) {
            var statement = this._mDBConn.createStatement("SELECT ROWID FROM jobs");
        
            while (statement.executeStep()) {  
				
				let value = statement.row.rowid; 
				results.push(value);
			}  
            
			statement.finalize();
        }
    
        count.value =  results.length;
        return results;
    },
    /* 
  void exec(in AString aTarget,
            out unsigned long aCount,
            [retval, array, size_is(aCount)] out wstring aValues);
    function exec(aTarget, aCount)
    {
      var aValues = this.regexp.exec(aTarget);
      aCount.value  = aValues.length;
      return aValues;
    }
 */

};
var components = [DatabaseManager];
function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule(components);
}

