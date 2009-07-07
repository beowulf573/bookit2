const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
let Cu = Components.utils;
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

let gObserverService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
let gJobListener = null;

function Startup()
{
    gJobListener = new JobListener();
    gObserverService.addObserver(gJobListener, "BookitJobs", false);
}


function Shutdown()
{
    gObserverService.removeObserver(gJobListener, "BookitJobs");
    gJobListener = null;
}