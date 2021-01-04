import { memo } from "react";
import { useEffect } from "react";
import editor from "../editor";
import { readFileSync, unlinkSync, writeFileSync } from "fs";
import { CONTENT_TEMPLATE, TEMP_FILE } from "../constants";

type NewSnippetProps = {
	onCreate?: (content: string) => void;
};

function NewSnippet({ onCreate }: NewSnippetProps) {
	const filePath = `./${TEMP_FILE}`;

	useEffect(() => {
		writeFileSync(filePath, CONTENT_TEMPLATE);
		try {
			editor(filePath);
			const content = readFileSync(filePath, "utf-8");
			onCreate?.(content);
			unlinkSync(filePath);
		} catch (ex) {
			console.error(ex);
		}
	}, []);
	return null;
}

export default memo(NewSnippet);
