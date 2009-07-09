
function JobListener() {}

JobListener.prototype = {
  //////////////////////////////////////////////////////////////////////////////
  //// nsISupports

  QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver]),

  observe: function(aSubject, aTopic, aData) {

    // aData - rowID for entry in db
    var job = gDB.getJob(aData);
	if(job) {
	
		var itemList = gJobsView.getElementsByAttribute("id", "item_" + aData);
		var item = (itemList.length > 0 ? itemList.item(0) : null);
		if(item) {
            var labelList = item.getElementsByAttribute("id", "label_job_state");
            var label = (labelList.length > 0 ? labelList.item(0) : null);
            if(label) {
                label.value = job.state;
                if(job.error) {
                    label.setAttribute("class", "labelError");
                }
            }
            var progressList = item.getElementsByAttribute("id", "job_progress");
            var progress = (progressList.length > 0 ? progressList.item(0) : null);
            if(progress) {
                progress.setAttribute("value", job.percent_done);
                if(job.percent_done == 100) {
                    progress.style.display = "none";
                    //progress.setAttribute("style", "display: none;");
                }
                else {
                    //progress.setAttribute("style", "display: visible;");
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