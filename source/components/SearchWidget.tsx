import { Box, Text, useInput } from "ink";
import React, { useEffect } from "react";
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
		<Text color="blueBright">
			{selected ? "⚪" : "⚫"} {label.slice(0, 100)}
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
				<Box>
					<Text color="yellow" bold>
						🔎 SEARCH:{" "}
					</Text>
					<TextInput value={query} onChange={setQuery} />
				</Box>
			)}
			<Box flexDirection="column" marginY={1}>
				{fetching && (
					<Box>
						<Spinner type="dots" />
						<Text color="green"> Loading...</Text>
					</Box>
				)}
				{!fetching && (
					<Text color="gray">
						{selectedIndex + 1} of {items.length}
					</Text>
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
			<Text>{marked(items[selectedIndex]?.content || "")}</Text>
		</Box>
	);
}
