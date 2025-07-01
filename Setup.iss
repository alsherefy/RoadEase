[Setup]
AppName=RoadEase
AppVersion=1.0
DefaultDirName={pf}\RoadEase
DefaultGroupName=RoadEase
OutputDir=Output
OutputBaseFilename=Setup
Compression=lzma
SolidCompression=yes

[Files]
Source: "dist\RoadEase.exe"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\RoadEase"; Filename: "{app}\RoadEase.exe"
Name: "{commondesktop}\RoadEase"; Filename: "{app}\RoadEase.exe"; Tasks: desktopicon

[Tasks]
Name: desktopicon; Description: "Create a &desktop icon"; GroupDescription: "Additional icons:"; Flags: unchecked