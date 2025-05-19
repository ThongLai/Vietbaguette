@echo off
echo This script will create an initial admin user in the database.
echo WARNING: This will create a real admin user with access to your system.
echo.

set /p confirm="Are you sure you want to continue? (Y/N): "
if /i "%confirm%" NEQ "Y" (
    echo Operation cancelled.
    exit /b
)

cd backend
node scripts/seedAdmin.js

echo.
echo If successful, you can now log in with the admin credentials.
echo IMPORTANT: Change the default password immediately after first login!
echo.
pause 