import fs from 'fs'
import os from "os"
import defaultLayoutConfig from '../config/DefaultLayoutConfig'
import defaultThresholdConfig from '../config/DefaultThresholdConfig'
import Finder from 'fs-finder'

const CONFIG_DIR_NAME = "PowerFC-Config";
const LAYOUT_CONFIG_FILE_NAME = "layout.json";
const THRESHOLD_CONFIG_FILE_NAME = "thresholds.json";
const MAC_DRIVE_DIRECTORY = "/VOLUMES";
const WINDOWS_DRIVE_DIRECTORY = "";
const LINUX_DRIVE_DIRECTORY = "/media/pi";

let cachedLayout = null;
let cachedThresholds = null;

export const getLayoutConfig = () => {
    cachedLayout = findConfigFileByName(LAYOUT_CONFIG_FILE_NAME);
    if (!cachedLayout) {
        cachedLayout = defaultLayoutConfig;
    }
    return cachedLayout;
}

export const getThresholdConfig = () => {
    cachedThresholds = findConfigFileByName(THRESHOLD_CONFIG_FILE_NAME);
    if (!cachedThresholds) {
        cachedThresholds = defaultThresholdConfig;
    }
    return cachedThresholds;
}

const findConfigFileByName = (name) => {
    const foundDirectory = findConfigDirectory();
    if (foundDirectory) {
        if (Finder.in(foundDirectory).findFile(name)) {
            let contents = fs.readFileSync(foundDirectory + "/" + name);
            try {
                let jsonContents = JSON.parse(contents);
                console.log("Using USB-defined config " + name);
                return jsonContents;
            } catch (e) {
                console.log("Error parsing json: ", e);
            }
        }
    }

    return null;
}

const findConfigDirectory = () => {
    let volumes;
    switch (os.platform()) {
        case "darwin":
            volumes = Finder.in(MAC_DRIVE_DIRECTORY).findDirectories();
            break;
        case "win32":
            volumes = Finder.in(WINDOWS_DRIVE_DIRECTORY).findDirectories();
            break;
        default: // linux etc.
            volumes = Finder.in(LINUX_DRIVE_DIRECTORY).findDirectories(); // ONLY works when there is a pi subfolder
            break;
    }

    for (const volume of volumes) {
        const foundDirectory = Finder.in(volume).findDirectory(CONFIG_DIR_NAME);
        if (foundDirectory) {
            return foundDirectory;
        }
    }

    return null;
}