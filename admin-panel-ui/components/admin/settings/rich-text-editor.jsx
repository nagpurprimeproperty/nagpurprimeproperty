"use client"

/**
 * RichTextEditor
 *
 * A lightweight rich text editor built on native contenteditable with
 * execCommand for formatting. Uses no external dependencies so it works
 * instantly without npm installs.
 *
 * Props:
 *   value    — controlled HTML string
 *   onChange — called with new HTML string on every change
 *   disabled — optional, disables editing
 */
import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Bold, Italic, Underline, List, ListOrdered, Heading2, Heading3, AlignLeft, AlignCenter, Quote, Undo, Redo, Link2, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
function ToolbarButton({ icon: Icon, label, command, value, disabled }) {
    const exec = (e) => {
        e.preventDefault();
        document.execCommand(command, false, value);
    };
    return (<Button type="button" variant="ghost" size="icon" className="h-8 w-8" title={label} disabled={disabled} onMouseDown={exec}>
      <Icon className="h-4 w-4"/>
    </Button>);
}
export function RichTextEditor({ value, onChange, disabled = false, placeholder = "Start writing...", className, minHeight = 320, }) {
    const editorRef = useRef(null);
    const isInternal = useRef(false);
    // Sync external value → DOM (only if different, to avoid cursor jump)
    useEffect(() => {
        const el = editorRef.current;
        if (!el || isInternal.current)
            return;
        if (el.innerHTML !== value) {
            el.innerHTML = value || "";
        }
    }, [value]);
    const handleInput = useCallback(() => {
        const el = editorRef.current;
        if (!el)
            return;
        isInternal.current = true;
        onChange(el.innerHTML);
        setTimeout(() => { isInternal.current = false; }, 0);
    }, [onChange]);
    const handleLink = (e) => {
        e.preventDefault();
        const url = prompt("Enter URL:", "https://");
        if (url)
            document.execCommand("createLink", false, url);
    };
    const tools = [
        { icon: Bold, label: "Bold", command: "bold" },
        { icon: Italic, label: "Italic", command: "italic" },
        { icon: Underline, label: "Underline", command: "underline" },
        "sep",
        { icon: Heading2, label: "Heading 2", command: "formatBlock", value: "h2" },
        { icon: Heading3, label: "Heading 3", command: "formatBlock", value: "h3" },
        "sep",
        { icon: AlignLeft, label: "Align Left", command: "justifyLeft" },
        { icon: AlignCenter, label: "Align Center", command: "justifyCenter" },
        "sep",
        { icon: List, label: "Bullet List", command: "insertUnorderedList" },
        { icon: ListOrdered, label: "Numbered List", command: "insertOrderedList" },
        { icon: Quote, label: "Blockquote", command: "formatBlock", value: "blockquote" },
        "sep",
        { icon: Undo, label: "Undo", command: "undo" },
        { icon: Redo, label: "Redo", command: "redo" },
    ];
    return (<div className={cn("rounded-lg border border-input overflow-hidden", disabled && "opacity-60 pointer-events-none", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-muted/30">
        {tools.map((tool, i) => tool === "sep" ? (<Separator key={i} orientation="vertical" className="h-6 mx-1"/>) : (<ToolbarButton key={tool.command + (tool.value ?? "")} {...tool} disabled={disabled}/>))}
        {/* Link button — needs special handler */}
        <Separator orientation="vertical" className="h-6 mx-1"/>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" title="Insert Link" disabled={disabled} onMouseDown={handleLink}>
          <Link2 className="h-4 w-4"/>
        </Button>
      </div>

      {/* Editable area */}
      <div ref={editorRef} contentEditable={!disabled} suppressContentEditableWarning onInput={handleInput} style={{ minHeight }} data-placeholder={placeholder} className={cn("p-4 outline-none text-sm leading-relaxed", "prose prose-sm max-w-none", 
        // Custom prose styles using Tailwind utilities
        "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2", "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-2", "[&_p]:mb-3 [&_p]:leading-relaxed", "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3", "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3", "[&_li]:mb-1", "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground", "[&_a]:text-primary [&_a]:underline", "[&_strong]:font-bold", "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50")}/>
    </div>);
}
