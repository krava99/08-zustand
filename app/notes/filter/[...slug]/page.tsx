import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { fetchNotes, FetchNotesParams } from "@/lib/api";
import NotesClient from "./Notes.client";
import { Metadata } from "next";

type Params = { slug: string[] };

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const filterSlug = slug?.[0] || "all";

  return {
    title: "Notes",
    description: "Notes filter",
    openGraph: {
      title: "Notes selection",
      description: `Notes filter by ${filterSlug}`,
      url: `app/notes/filter/${filterSlug}`,
      images: [
        {
          url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
          width: 1200,
          height: 630,
          alt: "NoteHub App",
        },
      ],
    },
  };
}

export default async function FilteredNotesPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const filterSlug = slug?.[0] || "all";
  const tagToFetch = filterSlug === "all" ? undefined : filterSlug;

  const fetchParams: FetchNotesParams = {
    page: 1,
    perPage: 12,
    search: "",
    tag: tagToFetch,
  };

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["notes", { ...fetchParams }],
    queryFn: () => fetchNotes(fetchParams),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient tag={(tagToFetch ?? "all") as "all"} />
    </HydrationBoundary>
  );
}
