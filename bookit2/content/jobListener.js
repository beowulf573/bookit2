
function JobListener() {}

JobListener.prototype = {
  //////////////////////////////////////////////////////////////////////////////
  //// nsISupports

  QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver]),

  observe: function(aSubject, aTopic, aData) {

    // aData - rowID for entry in db
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
            if(job.error) {
                item.firstChild.children[1].setAttribute("class", "labelError");
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