/* ***** BEGIN LICENSE BLOCK *****
 *   Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is bookit2.
 *
 * The Initial Developer of the Original Code is
 * Eddie McCreary.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 * 
 ****** END LICENSE BLOCK ******/

String.prototype.format = function()
{
var pattern = /\{\d+\}/g;
var args = arguments;
return this.replace(pattern, function(capture){ return args[capture.match(/\d+/)]; });
}

Components.utils.import("resource://bookit2/BookitConversion.js");


var bookit2 = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("bookit2-strings");
    
    document.getElementById("contentAreaContextMenu")
            .addEventListener("popupshowing", function(e) {  bookit2.onContextPopupShowing(e); }, false);
    document.getElementById("menu_ToolsPopup")
            .addEventListener("popupshowing", function(e) {  bookit2.onToolsPopupShowing(e); }, false);
    document.getElementById("menu_statusmenu_bookit_popup")
            .addEventListener("popupshowing", function(e) {  bookit2.onStatusPopupShowing(e); }, false);
	
	if (!this.oBookit2Pref && !this.bBookit2Initializing)
	{
		this.bBookit2Initializing = true;
		setTimeout('bookit2.Init();', 500);
	}
			
  },

  Init: function() {
  
	if (!this.Bookit2IsInitialized)
	{
		this.Bookit2SettingsObserver =
		{
			observe: function(subject, topic, data)
			{				
                if(topic != "nsPref:changed") {
                    return;
                }
                
                switch(data)
                {
                    case "hide_statusbar":
                    bookit2.updateStatusBar();
                    break;
                }
			}
		}
		
		
        // setup observer for pref changes
		this.oBookit2Pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.bookit2.");

        this.oBookit2Pref.QueryInterface(Components.interfaces.nsIPrefBranch2);
        this.oBookit2Pref.addObserver("", this.Bookit2SettingsObserver, false);
        	
	bookit2.updateStatusBar();
		
	this.Bookit2IsInitialized = true;
        
/*
        if(GetBookitPrefBool("show_help")) {
        
            SetBookitPrefBool("show_help", false);
            this.onShowHelp();
        }
*/
    }
  },
  
  onUnload: function() {
    // TODO: why is this necessary?
	if(this.oBookit2Pref)
    	this.oBookit2Pref.removeObserver("", this.Bookit2SettingsObserver);
  
  },
  onShowHelp: function() {
  
    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
               .getService(Components.interfaces.nsIWindowMediator);
    var mainWindow = wm.getMostRecentWindow("navigator:browser");
    var tabbrowser = mainWindow.getBrowser();

    var newTab = tabbrowser.addTab("chrome://bookit2/content/help.html");

    tabbrowser.selectedTab = newTab;
    tabbrowser.focus();      
  },
  onToolsPopupShowing: function(event) {
    // show or hide the menuitem based on what the context menu is on
    // see http://kb.mozillazine.org/Adding_items_to_menus
    document.getElementById("tools-bookit2").hidden = GetBookitPrefBool("hide_toolsmenu");
	var selection = document.commandDispatcher.focusedWindow.getSelection();
	      
	var hideSelection = false;
	if(selection == null || selection.toString().length == 0) {         
	    hideSelection = true;                 
	}      
	document.getElementById("menu_toolsmenu_bookit_selection_ebook").hidden = hideSelection;        
  },
  
  onContextPopupShowing: function(event) {
    // show or hide the menuitem based on what the context menu is on
    // see http://kb.mozillazine.org/Adding_items_to_menus
    document.getElementById("context-bookit2").hidden = GetBookitPrefBool("hide_contextmenu");
	var selection = document.commandDispatcher.focusedWindow.getSelection();
	      
	var hideSelection = false;
	if(selection == null || selection.toString().length == 0) {         
	    hideSelection = true;                 
	}      
	document.getElementById("menu_contextmenu_bookit_selection_ebook").hidden = hideSelection;        
  },
  onStatusPopupShowing: function(event) {
  
	var selection = document.commandDispatcher.focusedWindow.getSelection();
	      
	var hideSelection = false;
	if(selection == null || selection.toString().length == 0) {         
	    hideSelection = true;                 
	}      
	document.getElementById("menu_statusmenu_bookit_selection_ebook").hidden = hideSelection;        
  },
  onToolbarButtonCommand: function(e) {
    this.convertCurrentDocument();
  },
  onToolsCreate: function(e) {
    this.convertCurrentDocument();
  },
  onToolsJobs: function(e) {
    this.showJobs();
  },
  onContextJobs: function(e) {
    this.showJobs();
  },
  onStatusJobs: function(e) {
    this.showJobs();
  },
  
  onContextCreate: function(e) {
    this.convertCurrentDocument();
  },
  onStatusCreate: function(e) {
    this.convertCurrentDocument();
  },
  onToolsSelectionCreate: function(e) {
    this.convertCurrentSelection();
  },
  onContextSelectionCreate: function(e) {
    this.convertCurrentSelection();
  },
  onStatusSelectionCreate: function(e) {
    this.convertCurrentSelection();
  },
  onToolsShowPreferences: function(e) {
    this.showPreferences();
  },
  onContextShowPreferences: function(e) {
    this.showPreferences();
  },
  onStatusShowPreferences: function(e) {
    this.showPreferences();
  },
  showPreferences: function() {
		window.openDialog('chrome://bookit2/content/options.xul', 'PrefWindow', 'chrome,titlebar,toolbar,centerscreen,dialog=no'); 
  
  },
  onToolsShowEditor: function(e) {
    this.showEditor();
  },
  onContextShowEditor: function(e) {
    this.showEditor();
  },
  onStatusShowEditor: function(e) {
    this.showEditor();
  },
  showEditor: function() {
    var winName = "bookit:editor";
    var windowsMediator = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	var win = windowsMediator.getMostRecentWindow(winName);
	if (win) {
		
  		win.focus();
  	}
    else {
    	win = window.open("chrome://bookit2/content/editor.xul", 
                      winName, "chrome=yes,centerscreen,width=640,height=480,resize=yes,scrollbars=yes"); 
    	
    }
  },
  showJobs: function() {

    var jobGUI = Components.classes["@heorot.org/bookit-jobgui;1"].createInstance(Components.interfaces.nsIJobGui);

    jobGUI.open();
    
  },
  convertCurrentSelection: function() {
  
	var selection = this.getCurrentSelection();
	// alert(selection);
	
	var title = content.document.title;
    var author = this.getMetaValue("AUTHOR");
    
    author = (author == "" ? GetBookitPref("default_author") : author);

	var b = new BookitConversion();
        
    b.doConversion(window, selection, false, author, title);
  },
  
  getCurrentSelection:function() {
  	var selection = document.commandDispatcher.focusedWindow.getSelection();
	
	if(selection != null && selection.rangeCount > 0) {
	
	    var range = selection.getRangeAt(0);
	
	    var selRich = range.cloneContents(); 	
	
	    var xmlDocument = document.implementation.createDocument('', 'p', null);
	    xmlDocument.documentElement.appendChild(selRich);

	    // create serializer object
	    var xmlSerializer = new XMLSerializer();
	    // serialize
	    var content = xmlSerializer.serializeToString(xmlDocument);
		 content = "<html><body>" + content + "</body></html>";
		return content;
	}
	return "";
  },
  convertCurrentDocument:function() {
  
    var url = content.document.location;
    var title = content.document.title;
    var author = this.getMetaValue("AUTHOR");
    
    author = (author == "" ? GetBookitPref("default_author") : author);
    
	var b = new BookitConversion();
    
    b.doConversion(window, url, true, author, title);
    
  },
  getMetaValue: function( meta_name) {

    var my_arr=document.getElementsByTagName("META");
    for (var counter=0; counter<my_arr.length; counter++) {
        if (my_arr[counter].name.toLowerCase() == meta_name.toLowerCase()) {
           return my_arr[counter].content;
           }
    }
    return "";
  },
  updateStatusBar: function() {
	
	var oSItem = document.getElementById("statusbar-bookit");
	if (GetBookitPrefBool("hide_statusbar") && oSItem)  {
		oSItem.setAttribute("hidden", true);
	}
	else if (oSItem) {
		oSItem.setAttribute("hidden", false);
	}
  }   
};



function GetBookitPref(sName)
{
	try {return bookit2.oBookit2Pref.getComplexValue(sName, Components.interfaces.nsIPrefLocalizedString).data;}
	catch (e) {}
	return bookit2.oBookit2Pref.getCharPref(sName);
}

function SetBookitPref(sName, sData)
{
	var oPLS = Components.classes["@mozilla.org/pref-localizedstring;1"].createInstance(Components.interfaces.nsIPrefLocalizedString);
	oPLS.data = sData;
	bookit2.oBookit2Pref.setComplexValue(sName, Components.interfaces.nsIPrefLocalizedString, oPLS);
}

function GetBookitPrefBool(sName)
{
	return bookit2.oBookit2Pref.getBoolPref(sName);
}

function SetBookitPrefBool(sName, bData)
{
	bookit2.oBookit2Pref.setBoolPref(sName, bData);
}

function LOG(msg) {
  var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);
  consoleService.logStringMessage(msg);
}

window.addEventListener("load", function(e) { bookit2.onLoad(e); }, false);
addEventListener("unload", function(e) { bookit2.onUnload(e); } ,false);