import { Box, Text, useInput } from "ink";
import React, { useEffect } from "react";
import { useState } from "react";
import TextInput from "ink-text-input";
import marked from "marked";
import markedTerminal from "marked-terminal";
import data from "../data.json";
import { ChunkEntry, GistStore } from "../gists";

marked.setOptions({
	// Define custom renderer
	renderer: new markedTerminal(),
});

type SearchWidgetProps = {
	gistId: string;
	store: GistStore;
};

type ChunkItemProps = {
	label: string;
	selected: boolean;
};

const ChunkItem = ({ label, selected }: ChunkItemProps) => {
	return (
		<Text>
			{selected ? "⚪" : "⚫"} {label}
		</Text>
	);
};

export default function SearchWidget({ gistId, store }: SearchWidgetProps) {
	const entryPerPage = 5;
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [items, setItems] = useState<ChunkEntry[]>([]);
	const [page, setPage] = useState(0);
	const [query, setQuery] = useState("");

	useInput((_, key) => {
		if (key.downArrow) {
			setSelectedIndex((curr) => {
				const n = (curr + 1) % items.length;
				setPage(() => {
					return Math.floor(n / entryPerPage);
				});
				return n;
			});
		}
		if (key.upArrow) {
			setSelectedIndex((curr) => {
				const n = curr === 0 ? items.length - 1 : (curr - 1) % items.length;
				setPage(() => {
					return Math.floor(n / entryPerPage);
				});
				return n;
			});
		}
	});

	useEffect(() => {
		setSelectedIndex(0);
		setPage(0);
	}, [query]);

	useEffect(() => {
		store.getChunks(gistId).then((chunks) => {
			setItems(chunks);
		});
	}, []);

	return (
		<Box flexDirection="column">
			<Box>
				<Text color="yellow" bold>
					🔎 SEARCH:{" "}
				</Text>
				<TextInput value={query} onChange={setQuery} />
			</Box>
			<Box flexDirection="column" marginY={1}>
				<Text color="gray">
					{selectedIndex + 1} of {items.length}
				</Text>
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
			<Text>{items[selectedIndex]?.content}</Text>
		</Box>
	);
}
