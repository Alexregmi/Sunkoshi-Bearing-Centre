#!/bin/bash
set -e

echo "Starting Android SDK setup..."

# 1. Ensure java is installed
if ! command -v java &> /dev/null; then
    echo "Java is not installed yet. Please wait for the JDK package installer to complete."
    exit 1
fi

echo "Java version:"
java -version

# 2. Create target directory
mkdir -p /opt/android-sdk/cmdline-tools

# 3. Download cmdline-tools
cd /tmp
echo "Downloading commandlinetools..."
wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdline-tools.zip

echo "Extracting commandlinetools..."
unzip -q cmdline-tools.zip
rm -f cmdline-tools.zip

echo "Moving commandlinetools to destination..."
rm -rf /opt/android-sdk/cmdline-tools/latest
mv cmdline-tools /opt/android-sdk/cmdline-tools/latest

# 4. Set environment variables
export ANDROID_HOME=/opt/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

# 5. Accept licenses
echo "Accepting licenses..."
yes | sdkmanager --licenses

# 6. Install required SDK platform and build tools
echo "Installing SDK platforms and build tools..."
sdkmanager "platforms;android-36" "build-tools;36.0.0" "platforms;android-34" "build-tools;34.0.0" "platform-tools"

echo "Android SDK setup complete!"
