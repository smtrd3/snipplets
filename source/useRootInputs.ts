import { useInput } from "ink";
import { ModuleTypes } from "./app";

export function useRootInputs(
	setModule: (type: ModuleTypes | ((type: ModuleTypes) => ModuleTypes)) => void
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
			if (input.toLowerCase() === "d") {
				setImmediate(() => {
					setModule("delete");
				});
			}
			if (input.toLowerCase() === "e") {
				setImmediate(() => {
					setModule("edit");
				});
			}
		}
	});
}
