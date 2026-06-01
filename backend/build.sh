#!/bin/bash
set -e
pip install -r requirements.txt
apt-get update -qq && apt-get install -y -qq libreoffice --no-install-recommends
