#!/usr/bin/env bash

set -euo pipefail

versionsJsonUrl="https://ddragon.leagueoflegends.com/api/versions.json"
versionsJson="$(curl -fsSL "${versionsJsonUrl}")"

latestVersion="$(echo "${versionsJson}" | jq -r '.[0]')"

echo "Latest version: ${latestVersion}"

targetDir="public/assets/ddragon"
versionTxt="${targetDir}/version.txt"

if [ -f "$versionTxt" ]; then
    currentVersion="$(cat "${versionTxt}" | tr -d '\r\n' || true)"
    echo "Current version in repo: ${currentVersion}"

    if [ "${currentVersion}" = "${latestVersion}" ]; then
        echo "Already up-to-date. Skipping download."
        exit 0
    fi
else
    echo "No version.txt found yet. Will download assets."
fi

tilesDir="${targetDir}/tiles"
mkdir -p "${tilesDir}"

tgzUrl="https://ddragon.leagueoflegends.com/cdn/dragontail-${latestVersion}.tgz"
tgzFile="$(mktemp -t dragontail.XXXXXX.tgz)"

echo "Downloading: ${tgzUrl}"
curl -fL --retry 3 --retry-delay 5 -o "${tgzFile}" "${tgzUrl}"

tempExtractDir="$(mktemp -d)"
echo "Extracting selected files..."

# Only tiles with _0.jpg --> 0 is without a skin
tar -xzf "${tgzFile}" -C "${tempExtractDir}" --wildcards "img/champion/tiles/*_0.jpg"

tar -xzf "${tgzFile}" -C "${tempExtractDir}" "${latestVersion}/data/en_US/champion.json"

rm -f "${tgzFile}"

if [ -d "${tempExtractDir}/img/champion/tiles" ]; then
    cp -f "${tempExtractDir}/img/champion/tiles/"*_0.jpg "${tilesDir}/"
fi

cp -f "${tempExtractDir}/${latestVersion}/data/en_US/champion.json" "${targetDir}/champion.json"

echo -n "${latestVersion}" > "${versionTxt}"

rm -rf "${tempExtractDir}"