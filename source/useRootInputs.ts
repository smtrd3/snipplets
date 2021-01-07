import { useInput } from "ink";
import { ModuleTypes } from "./App";

export function useRootInputs(
	setModule: (type: ModuleTypes | ((type: ModuleTypes) => ModuleTypes)) => void,
	selectedChunkId: string
) {
	useInput((input, key) => {
		if (key.escape) {
			setImmediate(() => {
				setModule((curr) => (curr !== "search" ? "search" : curr));
			});
		}
		if (key.ctrl) {
			if (input.toLowerCase() === "n") {
				setImmediate(() => {
					setModule("new");
				});
			}
			if (input.toLowerCase() === "d" && selectedChunkId) {
				setImmediate(() => {
					setModule("delete");
				});
			}
			if (input.toLowerCase() === "e" && selectedChunkId) {
				setImmediate(() => {
					setModule("edit");
				});
			}
		}
	});
}
