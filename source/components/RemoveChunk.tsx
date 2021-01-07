import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import React, { useState } from "react";

export default function RemoveChunk({
	chunkId,
	onConfirm,
}: {
	chunkId: string;
	onConfirm: (chunkId: string, del: boolean) => void;
}) {
	const [response] = useState("");

	const onResponse = (response: string) => {
		if (["y", "Y"].includes(response.toLowerCase())) {
			onConfirm(chunkId, true);
		} else {
			onConfirm(chunkId, false);
		}
	};

	return (
		<Box>
			<Text color="redBright">
				Are you sure you want to delete selected chunk?{" "}
				<Text color="grey">Y/N </Text>
			</Text>
			<TextInput onChange={onResponse} value={response} />
		</Box>
	);
}
