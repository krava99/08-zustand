"use client";
import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchNotes, type FetchNotesResponse } from "@/lib/api";
import { NoteList } from "../../../../components/NoteList/NoteList";
import { Pagination } from "../../../../components/Pagination/Pagination";
import { SearchBox } from "../../../../components/SearchBox/SearchBox";
import { useDebounce } from "use-debounce";
import css from "./Notes.page.module.css";
import { NoteTag } from "@/types/note";
import Link from "next/link";
import Loading from "@/app/loading";
import ErrorDisplay from "@/app/error";

interface Props {
  tag: NoteTag | "all";
}

export const NotesClient = ({ tag }: Props) => {
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [debouncedSearch] = useDebounce(search, 300);

  const { data, isLoading, isError, isFetching, error } = useQuery<
    FetchNotesResponse,
    Error
  >({
    queryKey: ["notes", { page, search: debouncedSearch, tag }],
    queryFn: () =>
      fetchNotes({
        page: page,
        perPage: 12,
        search: debouncedSearch,
        tag: tag === "all" ? undefined : tag,
      }),
    placeholderData: keepPreviousData,
    refetchOnMount: false,
  });

  const handleSearchChange = (value: string): void => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const notes = data?.notes ?? [];
  const totalPages = data?.totalPages ?? 1;

  if (isError) {
    return <ErrorDisplay error={error!} />;
  }

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={search} onChange={handleSearchChange} />

        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}

        <Link
          href="/notes/action/create"
          className={css.button}
          aria-disabled={isFetching}
        >
          Create note +
        </Link>
      </header>

      {isFetching && !isLoading && <Loading />}

      {notes.length > 0 ? <NoteList notes={notes} /> : <p>No notes found</p>}
    </div>
  );
};

export default NotesClient;
