import { spawnSync } from "child_process";

export default function (
	file: string,
	editorBin: string | undefined = undefined
) {
	var ed = /^win/.test(process.platform) ? "notepad" : "vim";
	var editor = editorBin || process.env.VISUAL || process.env.EDITOR || ed;
	var args = editor.split(/\s+/);
	var bin = args.shift();

	if (bin) {
		return spawnSync(bin, args.concat([file]), { stdio: "inherit" });
	}
	return null;
}
