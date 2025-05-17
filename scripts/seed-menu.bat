@echo off
echo This script will seed the menu database with all menu items and options.
echo.
echo Press any key to continue or Ctrl+C to cancel.
pause > nul

cd backend
npm run seed:menu

echo.
echo Menu seeding complete! You can now access menu items in the database.
echo You can view and manage them through the Menu Management interface.
echo.
pause 