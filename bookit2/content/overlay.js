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
 * ***** END LICENSE BLOCK ***** */

var bookit2 = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("bookit2-strings");
    document.getElementById("contentAreaContextMenu")
            .addEventListener("popupshowing", function(e) { this.showContextMenu(e); }, false);
			
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
			observe: function(subject, topic, state)
			{				
				if (topic == "bookit2-settings" && state == 'OK' && typeof(bookit2.ApplySettings) == "function") {
					bookit2.ApplySettings();
				}
			}
		}
		
		var oObService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService)
		oObService.addObserver(this.Bookit2SettingsObserver, "bookit2-settings", false); 
		
		this.oBookit2Pref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.bookit2.");
		if (!this.oBookit2Pref.prefHasUserValue('hide_statusbar')) SetBookitPrefBool("hide_statusbar", false);
	
		bookit2.ApplySettings();
		
		this.Bookit2IsInitialized = true;
    }
  },
  
  onUnload: function() {
  
	var oObService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService)
	oObService.removeObserver(this.Bookit2SettingsObserver, "bookit2-settings"); 
  
  },
  
  showContextMenu: function(event) {
    // show or hide the menuitem based on what the context menu is on
    // see http://kb.mozillazine.org/Adding_items_to_menus
    document.getElementById("context-bookit2").hidden = gContextMenu.onImage;
  },
  onMenuItemCommand: function(e) {
    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                  .getService(Components.interfaces.nsIPromptService);
    promptService.alert(window, this.strings.getString("helloMessageTitle"),
                                this.strings.getString("helloMessage"));
  },
  onToolbarButtonCommand: function(e) {
    // just reuse the function above.  you can change this, obviously!
    bookit2.onMenuItemCommand(e);
  },

   ApplySettings: function() {
	
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