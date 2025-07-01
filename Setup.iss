[Setup]
AppName=RoadEase
AppVersion=1.0.2
DefaultDirName={pf}\RoadEase
DefaultGroupName=RoadEase
UninstallDisplayIcon={app}\main.exe
OutputDir=dist
OutputBaseFilename=RoadEaseSetup
Compression=lzma
SolidCompression=yes
WizardImageFile=roadease_logo.bmp
SetupIconFile=roadease_logo.bmp
LicenseFile=license.txt

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "arabic"; MessagesFile: "compiler:Languages\Arabic.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop icon"; GroupDescription: "Additional icons:"

[Files]
Source: "dist\RoadEase\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\RoadEase"; Filename: "{app}\main.exe"
Name: "{commondesktop}\RoadEase"; Filename: "{app}\main.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\main.exe"; Description: "Launch RoadEase"; Flags: nowait postinstall skipifsilent
