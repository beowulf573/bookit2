const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function BookitJobGui() { }

BookitJobGui.prototype = {
  classDescription: "Open Jobs GUI",
  classID:          Components.ID("{5851cedb-dbef-4411-8a06-2c368e1f7447}"),
  contractID:       "@heorot.org/bookit-jobgui;1",
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIJobGui]),
  
	open: function() {
        var wm = Cc["@mozilla.org/appshell/window-mediator;1"].
                 getService(Ci.nsIWindowMediator);
        var recent =  wm.getMostRecentWindow("BookitJobs:Manager");

        if(recent) {
            recent.focus();
        }
        else {

            var params = Cc["@mozilla.org/array;1"].createInstance(Ci.nsIMutableArray);    
            var ww = Cc["@mozilla.org/embedcomp/window-watcher;1"].
                     getService(Ci.nsIWindowWatcher);
            ww.openWindow(null,
                          "chrome://bookit2/content/jobs.xul",
                          "BookitJobs:Manager",
                          "chrome,dialog=no,resizable", params);
        }
    
    },
    

};
var components = [BookitJobGui];
function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule(components);
}
