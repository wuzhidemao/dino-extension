@echo off
cd /d C:\Users\BY\.qclaw\workspace\dino-extension
del .git\index.lock 2>nul
git add content.js manifest.json icons
git commit -m "v2.2: Fix all issues"
git push origin main
