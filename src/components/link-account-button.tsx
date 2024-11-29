'use client'

import React from "react"
import { Button } from "./ui/button"
import { getAurinkoAuthUrl } from "~/lib/aurinko"

const LinkAccountButton = () => {
	return (
		<Button onClick={
			async() => {
				const authUrl = await getAurinkoAuthUrl('Google')
				window.location.href = authUrl
			}
		}>
			Link Account with Aurinko
		</Button>
	)
}
export default LinkAccountButton