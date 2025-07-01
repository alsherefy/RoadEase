[Setup]
AppName=RoadEase
AppVersion=1.0.2
DefaultDirName={pf}\RoadEase
OutputDir=dist
OutputBaseFilename=RoadEaseSetup
Compression=lzma
SolidCompression=yes
LicenseFile=license.txt

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "arabic";  MessagesFile: "compiler:Languages\Arabic.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop icon"; Flags: unchecked

[Files]
Source: "dist\RoadEase\RoadEase.exe"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\RoadEase"; Filename: "{app}\RoadEase.exe"
Name: "{commondesktop}\RoadEase"; Filename: "{app}\RoadEase.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\RoadEase.exe"; Description: "Launch RoadEase"; Flags: nowait postinstall skipifsilent
