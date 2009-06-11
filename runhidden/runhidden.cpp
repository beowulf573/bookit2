// runhidden.cpp : Defines the entry point for the application.
//

#include "stdafx.h"
#include "runhidden.h"

// log file
FILE *fl_log = NULL;
void ReadFromPipe(HANDLE hRead) ;

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
	LPWSTR lpLogFile;

	if(nArgs > 1) {
		lpBatchFile = szArglist[1];
	}
	else {
		return 0;
	}

	if(nArgs > 2) {
		lpLogFile = szArglist[2];
	}
	else {
		return 0;
	}

	GetEnvironmentVariable(_T("COMSPEC"), szComSpec, MAX_PATH);
	if(_tcslen(szComSpec) == 0) {
		return 0;
	}

	if(_wfopen_s(&fl_log, lpLogFile, L"w,ccs=UTF-8") != 0) {
		return 0;
	}		 

	STARTUPINFO StartupInfo;
	PROCESS_INFORMATION ProcessInfo;
	SECURITY_ATTRIBUTES saAttr; 

	memset(&saAttr, 0, sizeof(SECURITY_ATTRIBUTES));

	saAttr.nLength = sizeof(SECURITY_ATTRIBUTES); 
	saAttr.bInheritHandle = TRUE; 
	saAttr.lpSecurityDescriptor = NULL; 

	HANDLE hChildStdinRd, hChildStdinWr,  hChildStdoutRd, hChildStdoutWr, hStdout;

	// current standard out
	hStdout = GetStdHandle(STD_OUTPUT_HANDLE); 
	 
	if(!CreatePipe(&hChildStdoutRd, &hChildStdoutWr, &saAttr, 0))  {	
		fclose(fl_log);
		return 0;
	}
	SetHandleInformation( hChildStdoutRd, HANDLE_FLAG_INHERIT, 0);

	if(!CreatePipe(&hChildStdinRd, &hChildStdinWr, &saAttr, 0)) {		
		fclose(fl_log);
		return 0;
	}
	SetHandleInformation( hChildStdinWr, HANDLE_FLAG_INHERIT, 0);


	memset(&StartupInfo, 0, sizeof(StartupInfo));
	
	StartupInfo.cb = sizeof(STARTUPINFO);
	StartupInfo.dwFlags = STARTF_USESHOWWINDOW | STARTF_USESTDHANDLES;
	StartupInfo.wShowWindow = SW_HIDE;
	StartupInfo.hStdError = hChildStdoutWr;
	StartupInfo.hStdOutput = hChildStdoutWr;
	StartupInfo.hStdInput = hChildStdinRd;


	TCHAR szCmd[MAX_PATH];

	wsprintf(szCmd, _T("%s /c %s"), szComSpec, lpBatchFile);
	if(CreateProcess( NULL, szCmd, NULL, NULL, TRUE,
					CREATE_NEW_CONSOLE, 
					NULL, 
					NULL,
					&StartupInfo,
					&ProcessInfo)) {

		if (CloseHandle(hChildStdoutWr)) {
		
			ReadFromPipe(hChildStdoutRd);
		}

		WaitForSingleObject(ProcessInfo.hProcess, INFINITE);
		CloseHandle(ProcessInfo.hThread);
		CloseHandle(ProcessInfo.hProcess);
	}
	fclose(fl_log);

	return 0;
}

void ReadFromPipe(HANDLE hRead) 
{ 	
   DWORD dwRead; 
   CHAR chBuf[1024];    
   TCHAR wszBuf[1024];
   for (;;) 
   { 
	  memset(chBuf, 0, 1024);
      if( !ReadFile( hRead, chBuf, 1024, &dwRead, NULL) || dwRead == 0) break;       
	  
	  ::MultiByteToWideChar( CP_ACP, 0, chBuf, strlen(chBuf)+1, 
								wszBuf,  sizeof(wszBuf)/sizeof(wszBuf[0]) );

	  _ftprintf_s(fl_log, L"%s\n", wszBuf);	  
   } 
} 
