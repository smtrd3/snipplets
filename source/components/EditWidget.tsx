import { useEffect } from "react";
import editor from "../editor";
import { readFileSync, unlinkSync, writeFileSync } from "fs";
import { CONTENT_TEMPLATE, TEMP_FILE } from "../constants";

type NewSnippetProps = {
	content?: string;
	onChange: (content: string) => void;
};

export default function EditWidget({ content, onChange }: NewSnippetProps) {
	const filePath = `./${TEMP_FILE}`;

	useEffect(() => {
		writeFileSync(filePath, content || CONTENT_TEMPLATE);
		try {
			editor(filePath);
			const content = readFileSync(filePath, "utf-8");
			onChange?.(content);
			unlinkSync(filePath);
		} catch (ex) {
			console.error(ex);
		}
	}, []);
	return null;
}
