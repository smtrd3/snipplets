import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import React from "react";
import { useState } from "react";

type InitWidgetProps = {
	onInit: (token: string) => void;
};

export default function ({ onInit }: InitWidgetProps) {
	const [token, setToken] = useState<string>("");

	return (
		<Box flexDirection="column">
			<TextInput
				value={token}
				placeholder=" Enter github token"
				onSubmit={onInit}
				onChange={setToken}
			/>
		</Box>
	);
}
