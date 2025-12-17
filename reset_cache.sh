#!/bin/bash
echo "Cleaning Watchman..."
watchman watch-del-all

echo "Cleaning Metro Cache..."
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-map-*

echo "Starting Metro with reset-cache..."
npm start -- --reset-cache
