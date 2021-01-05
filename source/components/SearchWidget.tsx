import { Box, Text, useInput } from "ink";
import React, { useEffect } from "react";
import { useState } from "react";
import TextInput from "ink-text-input";
import marked from "marked";
import markedTerminal from "marked-terminal";
import { ChunkEntry } from "../gists";
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
	const [filteredItem, setFilteredItem] = useState(items);

	useInput((_, key) => {
		if (key.downArrow) {
			setSelectedIndex((curr) => {
				const n = (curr + 1) % filteredItem.length;
				setSelectedId(filteredItem[n]?.id as string);
				setPage(() => {
					return Math.floor(n / entryPerPage);
				});
				return n;
			});
		}
		if (key.upArrow) {
			setSelectedIndex((curr) => {
				const n =
					curr === 0
						? filteredItem.length - 1
						: (curr - 1) % filteredItem.length;
				setSelectedId(filteredItem[n]?.id as string);
				setPage(() => {
					return Math.floor(n / entryPerPage);
				});
				return n;
			});
		}
	});

	useEffect(() => {
		setSelectedIndex(0);
		setSelectedId(filteredItem[0]?.id as string);
		setPage(0);
	}, [query]);

	useEffect(() => {
		fetchChunks();
	}, []);

	useEffect(() => {
		const queryTags = query.trim().slice(0, 50).toLowerCase().split(" ");
		const filteredItem = items.filter((item) => {
			const tags = item.tags;
			return queryTags.every((qtag) => {
				return tags.some((tag) => tag.startsWith(qtag));
			});
		});
		setFilteredItem(filteredItem);
	}, [query, items]);

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
			{fetching && (
				<Box paddingY={1}>
					<Spinner type="dots" />
					<Text color="green"> Loading...</Text>
				</Box>
			)}
			{fetching === false && (
				<Box
					flexDirection="column"
					borderStyle="bold"
					borderColor="grey"
					padding={1}
				>
					<Box>
						<Text>{marked(filteredItem[selectedIndex]?.content || "")}</Text>
					</Box>
					{!fetching && filteredItem.length > 0 && (
						<Box paddingLeft={3}>
							<Text color="redBright">
								{selectedIndex + 1} of {filteredItem.length}
							</Text>
						</Box>
					)}
					{filteredItem.length === 0 && query === "" && (
						<Text>
							Create your first snippet{" "}
							<Text color="redBright">
								Ctrl + <Text color="grey">N</Text>
							</Text>
						</Text>
					)}
					{filteredItem
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
			)}
		</Box>
	);
}
