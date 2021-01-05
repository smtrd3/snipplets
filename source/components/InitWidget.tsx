import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import TextInput from "ink-text-input";
import React from "react";
import { useState } from "react";
import Gradient from "ink-gradient";
import BigText from "ink-big-text";

type InitWidgetProps = {
	onInit: (token: string) => void;
};

export default function ({ onInit }: InitWidgetProps) {
	const [token, setToken] = useState<string>("");
	const [busy, setBusy] = useState(false);

	const onTokenSubmit = (tokenValue: string) => {
		if (!busy) {
			setBusy(true);
			onInit(tokenValue);
		}
	};

	return (
		<Box flexDirection="column" padding={1}>
			<Box flexDirection="column" marginBottom={1}>
				<BigText font="simple" text="Snipplets" />
				<Gradient name="rainbow">
					<Text>
						Simple tool for snippets management, uses github gists as storage
					</Text>
				</Gradient>
			</Box>
			<Box>
				<Text color="blueBright">To get started enter a github token </Text>
				<Text color="grey">(The token should have "gists" scope)</Text>
			</Box>
			<Box>
				{busy && (
					<Box marginRight={1}>
						<Spinner type="dots" />
					</Box>
				)}
				<TextInput
					value={token}
					placeholder="Enter github token"
					onSubmit={onTokenSubmit}
					onChange={setToken}
				/>
			</Box>
		</Box>
	);
}
