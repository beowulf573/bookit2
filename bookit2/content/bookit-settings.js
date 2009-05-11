function LoadWindow() {
	this.oBookitPref = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.bookit2.");

	var osbService = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService);
   	this.oStringBundle = osbService.createBundle("chrome://bookit2/locale/bookit2.properties");

	this.oHideStatusbar = document.getElementById('hide_statusbar');
	this.oHideStatusbar.checked = GetPrefBool("hide_statusbar");
}


function SaveSettings() {

	SetPrefBool("hide_statusbar", this.oHideStatusbar.checked);

	var oObService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
	oObService.notifyObservers(opener, "bookit2-settings", "OK");
	window.close();
}


function GetPref(sName)
{
	try {return this.oBookitPref.getComplexValue(sName, Components.interfaces.nsIPrefLocalizedString).data;}
	catch (e) {alert(e);}
	return this.oBookitPref.getCharPref(sName);
}

function SetPref(sName, sData)
{
	var oPLS = Components.classes["@mozilla.org/pref-localizedstring;1"].createInstance(Components.interfaces.nsIPrefLocalizedString);
	oPLS.data = sData;
	this.oBookitPref.setComplexValue(sName, Components.interfaces.nsIPrefLocalizedString, oPLS);
}

function GetPrefBool(sName)
{
	return this.oBookitPref.getBoolPref(sName);
}

function SetPrefBool(sName, bData)
{
	this.oBookitPref.setBoolPref(sName, bData);
}

function GetString(sName, sVar1, sVar2)
{
	var sResult = "";
	if(this.oStringBundle)
	{
		sResult  = this.oStringBundle.GetStringFromName(sName);
		if (sVar1) sResult = sResult.replace(/%1/g, sVar1);
		if (sVar2) sResult = sResult.replace(/%2/g, sVar2);
	}
	return sResult;
}    	

