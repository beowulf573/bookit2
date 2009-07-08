const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
let Cu = Components.utils;
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

Components.utils.import("resource://bookit2/DatabaseManager.js");

let gObserverService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
let gJobListener = null;
let gJobsView = null;
let gDB = null;

function Startup()
{
    gJobsView = document.getElementById("jobView");

	gDB = new DatabaseManager();
	gDB.open();
	buildJobList();
	
    gJobListener = new JobListener();
    gObserverService.addObserver(gJobListener, "BookitJobs", false);
}

function Shutdown()
{
    gObserverService.removeObserver(gJobListener, "BookitJobs");
    gJobListener = null;
	gDB.close();
	gDB = null;
}

function buildJobList()
{
	var jobs = gDB.getJobs();
	var len = jobs.length;
	for(var i = 0; i < len; i++) {
	
		var j = gDB.getJob(jobs[i]);

		item = createItem(jobs[i], j);

		gJobsView.appendChild(item);
	}
}

function createItem(id, job)
{
	let dl = document.createElement("richlistitem");
	dl.setAttribute("name", "item_" + id);
	dl.setAttribute("id", "item_" + id);
	dl.setAttribute("value", id);

	        
	var vbox = document.createElement("vbox");
	vbox.setAttribute("pack", "start");
	vbox.setAttribute("flex", "1");
	
	dl.appendChild(vbox);
	
	let labelTitle = document.createElement("label");
	labelTitle.setAttribute("value", job.title);
	labelTitle.setAttribute("id", "label_job_title");
	vbox.appendChild(labelTitle);
	
	let labelState = document.createElement("label");
	labelState.setAttribute("value", job.state);
	labelState.setAttribute("id", "label_job_state");
	vbox.appendChild(labelState);
	
	return dl;
}

function RemoveItem(event) {

  let index = gJobsView.selectedIndex;
  if(index >= 0) {
	var item = gJobsView.selectedItems[0];
    gJobsView.removeChild(item);
	gDB.deleteJob(item.getAttribute("value"));
    gJobsView.selectedIndex = Math.min(index, gJobsView.itemCount - 1);
  }
}

function ShowLog(event) {

}

function ClearAll() {

}

function LOG(msg) {
  var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);
  consoleService.logStringMessage(msg);
}