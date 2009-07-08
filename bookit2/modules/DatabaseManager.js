var EXPORTED_SYMBOLS = ["DatabaseManager"]


const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;

function DatabaseManager() {

}

DatabaseManager.prototype = {

    _mDBConn: null,

    open: function() {
    
        var ext_id = "{950a782d-e82f-45e2-9da7-44898356813d}";
        var em = Components.classes["@mozilla.org/extensions/manager;1"].
								getService(Components.interfaces.nsIExtensionManager);
        
        var installL = em.getInstallLocation(ext_id);

        var file = installL.getItemFile(ext_id, "bookit2.sqlite");
       
        var storageService = Components.classes["@mozilla.org/storage/service;1"]  
                                    .getService(Components.interfaces.mozIStorageService);  
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
            return this._mDBConn.lastInsertRowID;
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
    
		var params = {
			title: "",
			state: "",
			error: 0,
			percent_done: 0,
			path: "",
			valid: false
        };
        if(this._mDBConn != null) {
            var statement = this._mDBConn.createStatement("SELECT title,state,error,percent_done,path FROM jobs WHERE ROWID=:rowid");
            
	        statement.params.rowid = id;
        
            if(statement.executeStep()) {
			
				params.title = statement.row.title;
				params.state = statement.row.state;
				params.error = statement.row.error;
				params.percent_done = statement.row.percent_done;
				params.path = statement.row.path;
				params.valid = true;
			}
            statement.finalize();
        }
		
		return params;
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
    
    getJobs: function() {
    
		var results = [];
		
        if(this._mDBConn != null) {
            var statement = this._mDBConn.createStatement("SELECT ROWID FROM jobs");
        
            while (statement.executeStep()) {  
				
				let value = statement.row.rowid; 
				results.push(value);
			}  
            
			statement.finalize();
        }
		return results;
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