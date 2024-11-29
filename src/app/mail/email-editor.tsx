'use client'

import React from "react"
import StarterKit from "@tiptap/starter-kit"
import { EditorContent, useEditor } from "@tiptap/react"
import { Text } from '@tiptap/extension-text'
import EditorMenuBar from "./editor-menubar"
import { Separator } from "~/components/ui/separator"
import { Button } from "~/components/ui/button"
import TagInput from "./tag-input"
import { Input } from "~/components/ui/input"
import AIComposeButton from "./ai-compose-button"
import { generate } from "./action"
import { readStreamableValue } from "ai/rsc"

type Props = {
	subject: string;
    setSubject: (subject: string) => void;

	toValues: { label: string, value: string }[];
    setToValues: (values: { label: string, value: string }[]) => void;
	
    ccValues: { label: string, value: string }[];
    setCcValues: (values: { label: string, value: string }[]) => void;

    to: string[]
    handleSend: (value: string) => void;
    isSending: boolean;


    defaultToolbarExpand?: boolean;
}

const EmailEditor = ({ toValues, ccValues, subject, setSubject, to, handleSend, isSending, setToValues, setCcValues, defaultToolbarExpand=false}: Props) => {

	const [value, setValue] = React.useState<string>('')
	const [expanded, setExpanded] = React.useState<boolean>(defaultToolbarExpand)
	const [token, setToken] = React.useState<string>('')

	const aiGenerate = async () => {
		const {output} = await generate(value)
		for await (const token of readStreamableValue(output)){
			if(token){
				setToken(token)
			}
		}
	}
	

	const CustomText = Text.extend({
		addKeyboardShortcuts() {
			return {
				'Meta-j': () => {
					aiGenerate()
					return true
				}
			}
		},
	})

	const editor = useEditor({
		autofocus: false,
		extensions: [StarterKit, CustomText],
		onUpdate: ({editor}) => {
			setValue(editor.getHTML())
		}
	})
	React.useEffect(() => {
		editor?.commands?.insertContent(token)
	},[editor, token])

	const onGenerate = (token: string) => {
		editor?.commands?.insertContent(token)
	}

	if(!editor) return null
	return (
		<div>
            <div className="flex p-4 py-2 border-b">
			<EditorMenuBar editor={editor}/>
			</div>

            <div  className="p-4 pb-0 space-y-2">
                {expanded && (
                    <>
                        <TagInput
							label="To"
							onChange={setToValues}
							placeholder="Add Recipients"
							value={toValues}
						 />
                        <TagInput
							label="Cc"
							onChange={setCcValues}
							placeholder="Add Recipients"
							value={ccValues}
						 />
                        <Input id="subject" className="w-full" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
                    </>
                )}
                <div className="flex items-center gap-2">
                    <div className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
                        <span className="text-green-600 font-medium">
                            Draft{' '}
                        </span>
                        <span>
                            to {to.join(', ')}
                        </span>
                    </div>
                    <AIComposeButton
                        isComposing={defaultToolbarExpand}
                        onGenerate={onGenerate}
                    />
                </div>
            </div>
			
            <div className="prose w-full px-4">
                <EditorContent value={value} editor={editor} placeholder="Write your email here..." />
            </div>
            <Separator />
            <div className="py-3 px-4 flex items-center justify-between">
                <span className="text-sm">
                    Tip: Press{" "}
                    <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
                        Cmd + J
                    </kbd>{" "}
                    for AI autocomplete
                </span>
                <Button 
					onClick={async () => { 
						editor?.commands?.clearContent();
						await handleSend(value)
					}} disabled={isSending}
					>
                    Send
                </Button>
            </div>
        </div>
    );
	
}

export default EmailEditor