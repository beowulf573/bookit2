// runhidden.cpp : Defines the entry point for the application.
//

#include "stdafx.h"
#include "runhidden.h"


int APIENTRY _tWinMain(HINSTANCE hInstance,
                     HINSTANCE hPrevInstance,
                     LPTSTR    lpCmdLine,
                     int       nCmdShow)
{
//	UNREFERENCED_PARAMETER(lpCmdLine);

	LPWSTR *szArglist;
	int nArgs;   	
	TCHAR szComSpec[MAX_PATH];

	LPWSTR lpCommandLine = GetCommandLineW();

	// get array
	szArglist = CommandLineToArgvW(lpCommandLine, &nArgs);
   
	if( NULL == szArglist ) {      
		return 0;
	}

	LPWSTR lpBatchFile;

	if(nArgs > 1) {
		lpBatchFile = szArglist[1];
	}
	else {
		return 0;
	}

	GetEnvironmentVariable(_T("COMSPEC"), szComSpec, MAX_PATH);
	if(_tcslen(szComSpec) == 0) {
		return 0;
	}

	STARTUPINFO StartupInfo;
	PROCESS_INFORMATION ProcessInfo;
	SECURITY_ATTRIBUTES saAttr; 

	memset(&saAttr, 0, sizeof(SECURITY_ATTRIBUTES));

	saAttr.nLength = sizeof(SECURITY_ATTRIBUTES); 
	saAttr.bInheritHandle = TRUE; 
	saAttr.lpSecurityDescriptor = NULL; 

	memset(&StartupInfo, 0, sizeof(StartupInfo));
	
	StartupInfo.cb = sizeof(STARTUPINFO);
	StartupInfo.dwFlags = STARTF_USESHOWWINDOW;
	StartupInfo.wShowWindow = SW_HIDE;

	TCHAR szCmd[MAX_PATH];

	wsprintf(szCmd, _T("%s /c %s"), szComSpec, lpBatchFile);
	CreateProcess( NULL, szCmd, NULL, NULL, TRUE,
					CREATE_NEW_CONSOLE, 
					NULL, 
					NULL,
					&StartupInfo,
					&ProcessInfo);

	WaitForSingleObject(ProcessInfo.hProcess,INFINITE); 

	return 0;
}

