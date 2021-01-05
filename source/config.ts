import { existsSync, readFileSync, writeFileSync } from "fs";
import { CONFIG_FILE } from "./constants";
import { filePathInHomeDir } from "./utils";

export type Config = { gistId: string; token: string };

const CONFIG_FILE_PATH = filePathInHomeDir(CONFIG_FILE);

export function getConfig() {
	const exists = existsSync(CONFIG_FILE_PATH);
	return exists
		? (JSON.parse(readFileSync(CONFIG_FILE_PATH, "utf-8")) as Config)
		: null;
}

export function putConfig(config: Config) {
	writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config));
}
