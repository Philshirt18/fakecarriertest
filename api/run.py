#!/usr/bin/env python3
import os
import subprocess
import sys

# Get port from environment or use default
port = os.environ.get('PORT', '8000')

# Run uvicorn
cmd = [
    'uvicorn',
    'app.main:app',
    '--host', '0.0.0.0',
    '--port', port
]

print(f"Starting uvicorn on port {port}...")
sys.exit(subprocess.call(cmd))
