import { createFileRoute } from "@tanstack/react-router";
import NoteVaultApp from "@/components/NoteVaultApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NoteVault — Secure Notes, Beautifully Organized" },
      {
        name: "description",
        content:
          "NoteVault is a private, rich-text note workspace with folders, favorites, search and export.",
      },
      { property: "og:title", content: "NoteVault — Secure Notes, Beautifully Organized" },
      {
        property: "og:description",
        content:
          "A private, rich-text note workspace with folders, favorites, search and export.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NoteVaultApp,
});
