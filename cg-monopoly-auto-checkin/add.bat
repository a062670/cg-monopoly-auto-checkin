schtasks /delete /tn "cg-monopoly-auto-checkin" /f
SCHTASKS /Create /SC ONLOGON /delay 0001:00 /TN "cg-monopoly-auto-checkin" /TR "%~dp0%run.bat"