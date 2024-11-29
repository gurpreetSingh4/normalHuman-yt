'use client'
import { Button } from "~/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog"

import React from 'react'
import { generateEmail } from "./action"
import { readStreamableValue } from "ai/rsc"
import { Bot } from "lucide-react"
import { Textarea } from "~/components/ui/textarea"
import useThreads from '~/hooks/use-threads'
import { turndown } from "~/lib/turndown"

type Props = {
    onGenerate: (token: string) => void
    isComposing?: boolean
}

const AIComposeButton = (props: Props) => {
    const [prompt, setPrompt] = React.useState('')
    const [open, setOpen] = React.useState(false)
    const { threads, threadId, account } = useThreads()

    const thread = threads?.find( (t) => t.id === threadId)

    const aiGenerate = async () => {
        let context = ''
        
        if(!props.isComposing){
            for(const email of thread?.emails ?? []){
                const content = `
                Subject:${email.subject}
                From: ${email.from}
                Sent: ${new Date(email.sentAt).toLocaleString()}
                Body: ${turndown.turndown(email.body ?? email.bodySnippet ?? '')}
                `
    
                context += content
            }
        }
        context += `
        My name is ${account?.name} and my email is ${account?.emailAddress}.
        `

        const { output } = await generateEmail(context, prompt)

        for await (const token of readStreamableValue(output)) {
            if (token) {
                props.onGenerate(token);
            }
        }

    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button onClick={() => setOpen(true)} size='icon' variant={'outline'}>
                    <Bot className="size-5" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>AI Smart Compose</DialogTitle>
                    <DialogDescription>
                        AI will compose an email based on the context of your previous emails.
                    </DialogDescription>
                    <div className="h-2"></div>
                    <Textarea
                        placeholder="What would you like to compose?"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                    <div className="h-2"></div>
                    <Button onClick={() => { 
                        aiGenerate()
                        setOpen(false)
                        setPrompt('') 
                        }}>
                            Generate
                        </Button>
                </DialogHeader>
            </DialogContent>
        </Dialog>

    )
}

export default AIComposeButton