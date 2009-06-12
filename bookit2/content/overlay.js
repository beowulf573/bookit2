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

Components.utils.import("resource://bookit2/BookitCommand.js");
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
    }
  },
  
  onUnload: function() {
  
	this.oBookit2Pref.removeObserver("", this.Bookit2SettingsObserver);
  
  },
  
  onToolsPopupShowing: function(event) {
    // show or hide the menuitem based on what the context menu is on
    // see http://kb.mozillazine.org/Adding_items_to_menus
    document.getElementById("tools-bookit2").hidden = GetBookitPrefBool("hide_toolsmenu");
  },
  
  onContextPopupShowing: function(event) {
    // show or hide the menuitem based on what the context menu is on
    // see http://kb.mozillazine.org/Adding_items_to_menus
    document.getElementById("context-bookit2").hidden = GetBookitPrefBool("hide_contextmenu");
  },
  onMenuItemCommand: function(e) {

  },
  onToolbarButtonCommand: function(e) {
    this.convertCurrentDocument();
  },

  convertCurrentDocument:function() {
  
    var url = content.document.location;
    var title = content.document.title;
    var author = this.getMetaValue("AUTHOR");
    
    author = (author == "" ? "Bookit" : author);
    
    this.doConversion(url, true, author, title);
    
  },
  doConversion: function(data, isURL, author, title) {
    
	// some characters screwup the meta data
	// replace all quote variants with single quote
    var re = /[\u0022\u0027\u0060\u00B4\u2018\u2019\u201C\u201D]/gi;
    
	title = title.replace(re, "'");    

    re = /[\~\':|\\\?\*<\">\+\[\]/]/g;            
    
    var filename = title.replace(re, "_");
    
    if(filename.length > 63) {
        filename = filename.substr(0,63);	
    }
    
    var format = GetBookitPref("output_format");
    if(GetBookitPrefBool("show_options_dlg")) {
    
        var params = {
            inn: {
                title: title,
                author: author,
                format: format,
                filename: filename
            },
            out: {
                title: null,
                author: null,
                format: null,
                filename: null,
                result: false
            }
        };
      
        openDialog(
               "chrome://bookit2/content/precreate.xul",
               "",
               "centerscreen,dialog=no,chrome,dependent,modal",
               params
               );
        if(params.out.result) {
        
            title = params.out.title;
            author = params.out.author;
            filename = params.out.filename;
            
            // TODO: check for extension
            filename = filename + "." + params.out.format;
        }
        else {
            return;
        }
    } 
    else {
        // attach default extension to filename
        filename = filename + "." + format;
    }

    var b = new BookitConversion();
    
    b.performConversion(data, isURL, author, title, filename);        
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