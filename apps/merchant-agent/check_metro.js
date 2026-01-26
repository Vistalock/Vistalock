try {
    const { getDefaultConfig } = require("expo/metro-config");
    console.log("expo/metro-config found");
} catch (e) {
    console.error("expo/metro-config NOT found");
}

try {
    const exclusionList = require('metro-config/src/defaults/exclusionList');
    console.log("metro-config exclusionList found");
} catch (e) {
    console.error("metro-config exclusionList NOT found");
}
