@echo off
start cmd /k "cd ../server & node src/index.js"
start cmd /k "cd ../web & npm run dev"