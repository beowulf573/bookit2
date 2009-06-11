// TODO: on format change update filename
// TODO: disable ok if fields not filled in

var PreCreate = {
  onLoad: function() {
  // variables, set controls
  var params = window.arguments[0];
  document.getElementById("opt_dialog_title").value = params.inn.title;
  document.getElementById("opt_dialog_author").value = params.inn.author;
  document.getElementById("opt_dialog_filename").value = params.inn.filename;
  
  var index = 0;
  switch(params.inn.format) {
    case "lrf":
        index = 0;
    break;
    case "epub":
        index = 1;
    break;
    case "mobi":
        index = 2;
    break;
  
  }
  
  document.getElementById("opt_dialog_output_format").selectedIndex = index;
  
    // TODO: common code?
    this.oBookit2Pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.bookit2.");

    this.oBookit2Pref.QueryInterface(Components.interfaces.nsIPrefBranch2);

    document.getElementById("opt_dialog_show").checked = PreCreate.GetBookitPrefBool("show_options_dlg");
    
    params.out.result = false;
  },

  onOK: function() {
  // set return variables
    var params = window.arguments[0];
    
    params.out.title = document.getElementById("opt_dialog_title").value;
    params.out.author = document.getElementById("opt_dialog_author").value;
    params.out.filename = document.getElementById("opt_dialog_filename").value;
    params.out.format = document.getElementById("opt_dialog_output_format").value;
    params.out.result = true;
    
    PreCreate.SetBookitPrefBool("show_options_dlg", document.getElementById("opt_dialog_show").checked);
  },
  
  onUnload: function() {
  
  },
  
  GetBookitPrefBool: function(sName) {
	return PreCreate.oBookit2Pref.getBoolPref(sName);
  },
  SetBookitPrefBool: function(sName, bData) {
	PreCreate.oBookit2Pref.setBoolPref(sName, bData);
  }
};