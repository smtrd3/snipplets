import { Box, Text, useInput } from "ink";
import React, { useEffect, useMemo } from "react";
import { useState } from "react";
import TextInput from "ink-text-input";
import marked from "marked";
import markedTerminal from "marked-terminal";
import { ChunkEntry, GistStore } from "../gists";
import Spinner from "ink-spinner";

marked.setOptions({
	// Define custom renderer
	renderer: new markedTerminal(),
});

type SearchWidgetProps = {
	fetching: boolean;
	items: ChunkEntry[];
	fetchChunks: () => void;
	setSelectedId: (chunkId: string) => void;
};

type ChunkItemProps = {
	label: string;
	selected: boolean;
};

const ChunkItem = ({ label, selected }: ChunkItemProps) => {
	return (
		<Text color="blueBright" wrap="truncate-end">
			<Text color={selected ? "greenBright" : "grey"}>{">> "}</Text>
			<Text underline={selected}>{label}</Text>
		</Text>
	);
};

export default function SearchWidget({
	fetching,
	items,
	fetchChunks,
	setSelectedId,
}: SearchWidgetProps) {
	const entryPerPage = 5;
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [page, setPage] = useState(0);
	const [query, setQuery] = useState("");

	useInput((_, key) => {
		if (key.downArrow) {
			setSelectedIndex((curr) => {
				const n = (curr + 1) % items.length;
				setSelectedId(items[n]?.id as string);
				setPage(() => {
					return Math.floor(n / entryPerPage);
				});
				return n;
			});
		}
		if (key.upArrow) {
			setSelectedIndex((curr) => {
				const n = curr === 0 ? items.length - 1 : (curr - 1) % items.length;
				setSelectedId(items[n]?.id as string);
				setPage(() => {
					return Math.floor(n / entryPerPage);
				});
				return n;
			});
		}
	});

	useEffect(() => {
		setSelectedIndex(0);
		setSelectedId(items[0]?.id as string);
		setPage(0);
	}, [query]);

	useEffect(() => {
		fetchChunks();
	}, []);

	return (
		<Box flexDirection="column">
			{fetching === false && (
				<Box borderColor="grey" borderStyle="single">
					<Text color="yellow" bold>
						:<Text> </Text>
					</Text>
					<TextInput
						value={query}
						onChange={setQuery}
						placeholder="Search chunks"
					/>
				</Box>
			)}
			<Box borderStyle="single" borderColor="grey">
				<Box flexDirection="column" width={40} paddingRight={3}>
					{fetching && (
						<Box>
							<Spinner type="dots" />
							<Text color="green"> Loading...</Text>
						</Box>
					)}
					{!fetching && (
						<Box paddingLeft={3}>
							<Text color="redBright">
								{selectedIndex + 1} of {items.length}
							</Text>
						</Box>
					)}
					{items
						.slice(page * entryPerPage, (page + 1) * entryPerPage)
						.map((item, index) => {
							return (
								<ChunkItem
									key={item.id}
									label={item.label}
									selected={selectedIndex === page * entryPerPage + index}
								/>
							);
						})}
				</Box>
				<Box flexGrow={1}>
					<Text>{marked(items[selectedIndex]?.content || "")}</Text>
				</Box>
			</Box>
		</Box>
	);
}
