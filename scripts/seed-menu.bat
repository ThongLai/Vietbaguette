@echo off
echo This script will seed the menu database with all menu items and options.
echo WARNING: This will upload data to your REAL database.
echo.

set /p confirm="Are you sure you want to continue? (Y/N): "
if /i "%confirm%" NEQ "Y" (
    echo Operation cancelled.
    exit /b
)

cd backend
npm run seed:menu

echo.
echo Menu seeding complete! You can now access menu items in the database.
echo You can view and manage them through the Menu Management interface.
echo.
pause 