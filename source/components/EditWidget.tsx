import { useEffect } from "react";
import editor from "../editor";
import { readFileSync, unlinkSync, writeFileSync } from "fs";
import { CONTENT_TEMPLATE, TEMP_FILE } from "../constants";

type NewSnippetProps = {
	chunkId: string;
	content?: string;
	onChange: (chunkId: string, content: string) => void;
};

export default function EditWidget({
	content,
	onChange,
	chunkId,
}: NewSnippetProps) {
	const filePath = `./${TEMP_FILE}`;

	useEffect(() => {
		writeFileSync(filePath, content || CONTENT_TEMPLATE);
		try {
			editor(filePath);
			const content = readFileSync(filePath, "utf-8");
			onChange?.(chunkId, content);
			unlinkSync(filePath);
		} catch (ex) {
			console.error(ex);
		}
	}, []);
	return null;
}
