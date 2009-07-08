Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function DatabaseJob() { }

DatabaseJob.prototype = {
  classDescription: "Component with single job data",
  classID:          Components.ID("{f6200135-b86e-48af-934f-7cecf9180f3c}"),
  contractID:       "@heorot.org/bookit-job;1",
  QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIDatabaseJob]),
  _logfile: "",
  _title: "",
  _state: "",
  _error: 0,
  _percent_done: 0,
  _path: "",
  
  get logfile() { return this._logfile; },
  set logfile(aValue) { this._logfile = aValue; },

  get title() { return this._title; },
  set title(aValue) { this._title = aValue; },

  get state() { return this._state; },
  set state(aValue) { this._state = aValue; },

  get error() { return this._error; },
  set error(aValue) { this._error = aValue; },

  get percent_done() { return this._percent_done; },
  set percent_done(aValue) { this._percent_done = aValue; },

  get path() { return this._path; },
  set path(aValue) { this._path = aValue; },
};
var components = [DatabaseJob];
function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule(components);
}

