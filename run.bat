@echo off
if not exist node_modules npm install
start "" http://localhost:8000
python server.py
