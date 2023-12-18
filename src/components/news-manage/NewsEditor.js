import React, { useEffect, useState } from 'react'
import { Editor } from "react-draft-wysiwyg";
import { ContentState, EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html'
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import htmlToDraft from 'html-to-draftjs';

export default function NewsEditor(props) {
  useEffect(() => {
    const html = props.content
    if (html === undefined) return
    const contentBlock = htmlToDraft(html);
    if (contentBlock) {
      const centenState = ContentState.createFromBlockArray
        (contentBlock.contentBlocks);
      const editorState = EditorState.createWithContent
        (centenState);
      setEditorState(editorState)
    }
  }, [props.content])
  const [editorState, setEditorState] = useState("")
  return (
    <div>
      <Editor
        editorState={editorState}
        toolbarClassName="aaaaa"
        wrapperClassName="bbbbb"
        editorClassName="ccccc"
        onEditorStateChange={(editorState) => setEditorState(editorState)}

        onBlur={() => {
          // console.log()

          props.getContent(draftToHtml(convertToRaw(editorState.getCurrentContent())))
        }}
      />
    </div>
  )
}
