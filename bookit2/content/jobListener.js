
function JobListener() {}

JobListener.prototype = {
  //////////////////////////////////////////////////////////////////////////////
  //// nsISupports

  QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver]),

  observe: function(aSubject, aTopic, aData) {

    // aData - rowID for entry in db
    //LOG("JobListener: " + aData);
	var job = gDB.getJob(aData);
	if(job) {
	
		var item = null;
		
		// find list item for aData,
		if (gJobsView.hasChildNodes())
		{
			var testID = "item_" + aData;
			var children = gJobsView.childNodes;
			for(var i = 0; i < children.length; i++) {
				if(children[i].id == testID) {
					item = children[i];
					break;
				}				
			}
		}

		// TODO: how to find child items and update text
		if(item) {
			item.firstChild.children[1].value = job.state;
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