import { homedir } from "os";
import path from "path";

export function filePathInHomeDir(file: string) {
	return path.join(homedir(), file);
}
