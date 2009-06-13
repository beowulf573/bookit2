/* ***** BEGIN LICENSE BLOCK *****
    This file is part of Bookit.

    Bookit is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Bookit is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Bookit.  If not, see <http://www.gnu.org/licenses/>.
 *
 * ***** END LICENSE BLOCK ***** */
var BookitEditor = {

    Init: function(editor)  {
		editor.contentDocument.designMode = "on";		
        setTimeout(function() { editor.contentWindow.focus(); }, 100);
    },
    onBold: function(editor) {
      try {
        editor.commandManager.doCommand('cmd_bold', {}, editor.contentWindow);       
      } 
      catch(e) {
        
      }	
	},

    onItalic: function(editor) {
      try {
        editor.commandManager.doCommand('cmd_italics', {}, editor.contentWindow);       
      } 
      catch(e) {
        
      }	
	},
	
    onUnderlined: function(editor) {
      try {
        editor.commandManager.doCommand('cmd_underline', {}, editor.contentWindow);       
      } 
      catch(e) {
        
      }	
	},
	
    onHeading: function(editor, level) {
      try {
      	
      	var params = Components.classes["@mozilla.org/embedcomp/command-params;1"];
        
        params = params.createInstance(Components.interfaces.nsICommandParams);        
        params.setStringValue("state_attribute", level);

      	editor.commandManager.doCommand('cmd_paragraphState',  params , editor.contentWindow);       
      } 
      catch(e) {
        
      }	
	},
    onFontFace: function(editor, name) {
      try {
      	
      	var params = Components.classes["@mozilla.org/embedcomp/command-params;1"];
        
        params = params.createInstance(Components.interfaces.nsICommandParams);        
        params.setStringValue("state_attribute", name);

      	editor.commandManager.doCommand('cmd_fontFace',  params , editor.contentWindow);       
      } 
      catch(e) {
        
      }	
	},
    onFontSize: function(editor, size) {
      try {
      	
      	var params = Components.classes["@mozilla.org/embedcomp/command-params;1"];
        
        params = params.createInstance(Components.interfaces.nsICommandParams);        
        params.setStringValue("state_attribute", size);

      	editor.commandManager.doCommand('cmd_fontSize',  params , editor.contentWindow);       
      } 
      catch(e) {
        
      }	
	},
	onShowSource: function(editor, checkState) {
      try {
      	var html;
		  if (checkState) {
		    html = document.createTextNode(editor.contentWindow.document.body.innerHTML);
		    editor.contentWindow.document.body.innerHTML = "";
		    html = editor.contentWindow.document.importNode(html, false);
			editor.contentWindow.document.body.appendChild(html);		    
		  } else {
		    html = editor.contentWindow.document.body.ownerDocument.createRange();
		    html.selectNodeContents(editor.contentWindow.document.body);
		    editor.contentWindow.document.body.innerHTML = html.toString();
		  }
      } 
      catch(e) {
        
      }	
	},
	onOrderedList: function(editor) {
		try {
			editor.commandManager.doCommand('cmd_ol', {}, editor.contentWindow);       
		}
		catch(e) {
		
		}			
	},
	onUnorderedList: function(editor) {
		try {
			editor.commandManager.doCommand('cmd_ul', {}, editor.contentWindow);       
		}
		catch(e) {
		
		}			
	},
	onLink: function(editor) {
		try {
			var localestrings = document.getElementById("localestrings");
			
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
							.getService(Components.interfaces.nsIPromptService);
			
			var input = {value: "http://"};
			var check = {value: false}; 

			result = prompts.prompt(window, localestrings.getString('bookit.title'), localestrings.getString('bookit.editor.url'), input, null, check);
			
			if(result) {
				var params = Components.classes["@mozilla.org/embedcomp/command-params;1"];
        
        		params = params.createInstance(Components.interfaces.nsICommandParams);        
        		params.setStringValue("state_attribute", input.value);
				
				editor.commandManager.doCommand('cmd_insertLinkNoUI', params, editor.contentWindow);  
			}     
		}
		catch(e) {
			alert(e); 
		}			
	},
	onImage: function(editor) {
		try {
			       
		}
		catch(e) {
		
		}			
	},
	doLoadBook: function(editor) {
		try {
			var file = this.askFileOpen();
			if(file != null) {
		
				var contents = this.getFileContents(file);
				if(contents != null) {
					var params = Components.classes["@mozilla.org/embedcomp/command-params;1"];
			
					params = params.createInstance(Components.interfaces.nsICommandParams);        
					params.setStringValue("state_data", contents);
					
					editor.commandManager.doCommand('cmd_insertHTML', params, editor.contentWindow);  
				}
			}			       
		}
		catch(e) {
		
		}			
	},
	doSaveBook: function(editor) {
		try {
			var filePath = this.askFileSave();
			
			if(filePath != null) {
				var source = editor.getEditor(editor.contentWindow).outputToString("text/html", 2);
				var foStream = Components.classes['@mozilla.org/network/file-output-stream;1']
								.createInstance(Components.interfaces.nsIFileOutputStream);
				foStream.init(filePath, 0x02 | 0x08 | 0x20, 0664, 0);
				foStream.write(source, source.length);
				foStream.close();							
			}
		}
		catch(e) {
		
		}			
	},
	askFileSave: function() {
		try {
			 var nsIFilePicker = Components.interfaces.nsIFilePicker;
			 var fp = Components.classes['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);
			 fp.init(window, null, nsIFilePicker.modeSave);
			 fp.defaultString = 'book.html';
			 fp.appendFilters(nsIFilePicker.filterHTML | nsIFilePicker.filterAll);						 
			 if (fp.show() == nsIFilePicker.returnOK || fp == nsIFilePicker.returnReplace) {
				return fp.file;
			 }
			 return null;			       
		}
		catch(e) {
		
		}			
	},
	askFileOpen: function() {
		try {
			  var nsIFilePicker = Components.interfaces.nsIFilePicker;
			 var fp = Components.classes['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);
			 fp.init(window, null, nsIFilePicker.modeOpen);
			 fp.appendFilters(nsIFilePicker.filterHTML | nsIFilePicker.filterAll);						 
			 if (fp.show() == nsIFilePicker.returnOK) {
			  return fp.file;
			 }
			 return null;
		}
		catch(e) {
		
		}			
	},
	getFileContents: function(file) {
		try {
			var data = '';
			var fstream = Components.classes['@mozilla.org/network/file-input-stream;1']
			  .createInstance(Components.interfaces.nsIFileInputStream);
			var sstream = Components.classes['@mozilla.org/scriptableinputstream;1']
			  .createInstance(Components.interfaces.nsIScriptableInputStream);
			fstream.init(file, -1, 0, 0);
			sstream.init(fstream); 		
			var str = sstream.read(4096);
			while (str.length > 0) {
				data += str;
				str = sstream.read(4096);
			}		
			sstream.close();
			fstream.close();
			return data;
		}
		catch(e) {
		
		}			
	},

	onCreateBook: function(editor) {
	
	
	},

}