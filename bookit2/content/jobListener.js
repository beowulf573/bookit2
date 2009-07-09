
function JobListener() {}

JobListener.prototype = {
  //////////////////////////////////////////////////////////////////////////////
  //// nsISupports

  QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver]),

  observe: function(aSubject, aTopic, aData) {

    // aData - rowID for entry in db
    var job = gDB.getJob(aData);
	if(job) {
	
		var item = gJobsView.getElementById("item_" + aData);
		
		if(item) {
            var label = item.getElementById("label_job_state");
            if(label) {
                label.value = job.state;
                if(job.error) {
                    label.setAttribute("class", "labelError");
                }
            }
		}
		else {
			item = createItem(aData, job);

			gJobsView.appendChild(item);
		}
	}
  }

};

function LOG(msg) {

  var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);
  consoleService.logStringMessage(msg);
}