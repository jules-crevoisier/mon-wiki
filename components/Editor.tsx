"use client";

import { useEffect, useRef } from "react";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";

interface EditorProps {
  initialMarkdown?: string;
  onChangeMarkdown?: (markdown: string) => void;
  editable?: boolean;
}

export default function Editor({
  initialMarkdown = "",
  onChangeMarkdown,
  editable = true,
}: EditorProps) {
  const editor = useCreateBlockNote();
  const hasLoadedInitialContentRef = useRef(false);

  useEffect(() => {
    const syncInitialContent = async () => {
      if (hasLoadedInitialContentRef.current || !initialMarkdown) {
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
          if (!onChangeMarkdown) return;
          const markdown = await editor.blocksToMarkdownLossy(editor.document);
          onChangeMarkdown(markdown);
        }}
      />
    </div>
  );
}
