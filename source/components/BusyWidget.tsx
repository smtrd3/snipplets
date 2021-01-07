import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import React from "react";

export default function BusyWidget() {
	return (
		<Box paddingY={1}>
			<Spinner type="dots" />
			<Text color="yellowBright"> Loading</Text>
			<Spinner type="simpleDots" />
		</Box>
	);
}
