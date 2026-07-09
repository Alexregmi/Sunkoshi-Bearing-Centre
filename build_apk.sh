#!/bin/bash
set -e

echo "=== Building Production Web Assets ==="
npm run build

echo "=== Synchronizing Assets with Capacitor ==="
npx cap sync

echo "=== Compiling Android Debug APK ==="
export ANDROID_HOME=/opt/android-sdk
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

cd android
chmod +x gradlew

echo "Running gradlew assembleDebug..."
./gradlew assembleDebug

# The generated APK is usually at android/app/build/outputs/apk/debug/app-debug.apk
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"

if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(stat -c%s "$APK_PATH")
    echo "=== APK Successfully Generated! ==="
    echo "Path: $APK_PATH"
    echo "Size: $APK_SIZE bytes"
    
    if [ "$APK_SIZE" -lt 1048576 ]; then
        echo "Error: APK size is less than 1 MB. Something is wrong with the compilation."
        exit 1
    fi
    
    # Create build output folders relative to workspace root (we are currently in android/, so go up)
    cd ..
    
    echo "=== Placing APK in target directories ==="
    mkdir -p .build-outputs
    mkdir -p APK_DOWNLOAD
    
    cp android/$APK_PATH .build-outputs/app-debug.apk
    cp android/$APK_PATH APK_DOWNLOAD/app-debug.apk
    
    echo "=== Verification ==="
    ls -lh .build-outputs/app-debug.apk
    ls -lh APK_DOWNLOAD/app-debug.apk
    echo "SUCCESS: APK successfully compiled and placed in both target locations!"
else
    echo "Error: Gradle finished but no APK was found at $APK_PATH."
    exit 1
fi
