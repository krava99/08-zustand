"use client";
import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchNotes, type FetchNotesResponse } from "@/lib/api";
import { NoteList } from "../../../../components/NoteList/NoteList";
import { Pagination } from "../../../../components/Pagination/Pagination";
import { Modal } from "../../../../components/Modal/Modal";
import { NoteForm } from "../../../../components/NoteForm/NoteForm";
import { SearchBox } from "../../../../components/SearchBox/SearchBox";
import { useDebounce } from "use-debounce";
import css from "./Notes.page.module.css";
import { NoteTag } from "@/types/note";

interface Props {
  tag: NoteTag | "all";
}

export const NotesClient = ({ tag }: Props) => {
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [debouncedSearch] = useDebounce(search, 300);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const { data, isLoading, isError, isFetching } = useQuery<
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

  if (isLoading) return <Loader />;
  if (isError) return <p>Error loading notes</p>;

  const notes = data?.notes ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={search} onChange={handleSearchChange} />
        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
        <button
          className={css.button}
          onClick={openModal}
          disabled={isFetching}
        >
          Create note +
        </button>
      </header>
      {notes.length ? <NoteList notes={notes} /> : <p>No notes found</p>}
      {isModalOpen && (
        <Modal onClose={closeModal}>
          <NoteForm onClose={closeModal} />
        </Modal>
      )}
    </div>
  );
};

export default NotesClient;
