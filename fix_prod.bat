@echo off
echo Checking and fixing production environment...

:: Get the absolute path
set APP_DIR=%~dp0

:: Check and create templates directory
if not exist "%APP_DIR%backend\templates" (
    echo Creating templates directory...
    mkdir "%APP_DIR%backend\templates"
)

:: Check if index.html exists in templates directory
if not exist "%APP_DIR%backend\templates\index.html" (
    echo Creating template index.html file...
    echo ^<!DOCTYPE html^> > "%APP_DIR%backend\templates\index.html"
    echo ^<html lang="es"^> >> "%APP_DIR%backend\templates\index.html"
    echo ^<head^> >> "%APP_DIR%backend\templates\index.html"
    echo     ^<meta charset="UTF-8"^> >> "%APP_DIR%backend\templates\index.html"
    echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^> >> "%APP_DIR%backend\templates\index.html"
    echo     ^<title^>Garden CDE^</title^> >> "%APP_DIR%backend\templates\index.html"
    echo ^</head^> >> "%APP_DIR%backend\templates\index.html"
    echo ^<body^> >> "%APP_DIR%backend\templates\index.html"
    echo     ^<div id="root"^>Loading...^</div^> >> "%APP_DIR%backend\templates\index.html"
    echo ^</body^> >> "%APP_DIR%backend\templates\index.html"
    echo ^</html^> >> "%APP_DIR%backend\templates\index.html"
)

:: Check and rebuild frontend
if not exist "%APP_DIR%frontend\dist\index.html" (
    echo Frontend build not found. Rebuilding...
    if exist "%APP_DIR%venv" (
        call "%APP_DIR%venv\Scripts\activate"
        cd "%APP_DIR%frontend"
        call npm run build:prod
        cd "%APP_DIR%"
    ) else (
        echo Virtual environment not found. Cannot rebuild frontend.
    )
) else (
    echo Frontend build exists.
)

:: Check settings_prod.py for proper template configuration
set SETTINGS_PROD="%APP_DIR%backend\backend\settings_prod.py"
findstr /C:"TEMPLATES[0]['DIRS']" %SETTINGS_PROD% >nul
if %ERRORLEVEL% NEQ 0 (
    echo Warning: Template directories may not be properly configured in settings_prod.py
    echo Please verify the TEMPLATES setting in %SETTINGS_PROD%
)

echo.
echo Fix completed. You can now try running run_prod.bat again.
pause
