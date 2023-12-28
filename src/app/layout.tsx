import type {Metadata} from 'next'
import {Noto_Sans_Math} from 'next/font/google'
import './globals.css'
import {ReactNode} from "react";
import { cn } from '@/utils';

const inter = Noto_Sans_Math({weight: "400",subsets:['math']})

export const metadata: Metadata = {
    title: 'Vyrologic',
    description: 'Application to calculate',
}

export default function RootLayout({children}: { children: ReactNode }) {
    return (
        <html lang="en">
        <body className={cn("min-h-screen",inter.className)}>
        {children}
        </body>
        </html>
    )
}
