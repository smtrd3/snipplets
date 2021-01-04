import { existsSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import path from "path";
import { CONFIG_FILE } from "./constants";

export type Config = { gistId: string; token: string };

const CONFIG_FILE_PATH = path.join(homedir(), CONFIG_FILE);

export function getConfig() {
	const exists = existsSync(CONFIG_FILE_PATH);
	return exists
		? (JSON.parse(readFileSync(CONFIG_FILE_PATH, "utf-8")) as Config)
		: null;
}

export function putConfig(config: Config) {
	writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config));
}
