"use client";

import { useEffect, useRef } from "react";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";

interface EditorProps {
  initialMarkdown?: string;
  initialBlocks?: unknown[];
  onChangeMarkdown?: (markdown: string) => void;
  onChangeBlocks?: (blocks: unknown[]) => void;
  editable?: boolean;
}

export default function Editor({
  initialMarkdown = "",
  initialBlocks,
  onChangeMarkdown,
  onChangeBlocks,
  editable = true,
}: EditorProps) {
  const editor = useCreateBlockNote(
    initialBlocks && initialBlocks.length > 0
      ? { initialContent: initialBlocks as never[] }
      : undefined
  );
  const hasLoadedInitialContentRef = useRef(false);

  useEffect(() => {
    const syncInitialContent = async () => {
      if (hasLoadedInitialContentRef.current || !initialMarkdown || (initialBlocks && initialBlocks.length > 0)) {
        return;
      }
      const blocks = await editor.tryParseMarkdownToBlocks(initialMarkdown);
      editor.replaceBlocks(editor.document, blocks);
      hasLoadedInitialContentRef.current = true;
    };

    void syncInitialContent();
  }, [editor, initialMarkdown]);

  return (
    <div className="wiki-editor-surface" style={{ fontSize: "16px" }}>
      <BlockNoteView
        editor={editor}
        editable={editable}
        onChange={async () => {
          onChangeBlocks?.(editor.document as unknown[]);
          if (onChangeMarkdown) {
            const markdown = await editor.blocksToMarkdownLossy(editor.document);
            onChangeMarkdown(markdown);
          }
        }}
      />
    </div>
  );
}
