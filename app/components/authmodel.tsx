'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ComponentLanguageProvider } from '../context/componentlanguagecontext'
import AuthModalContent from './authmodalcontent'

interface AuthModalProps {
    onClose: () => void
}

export default function AuthModal({ onClose }: AuthModalProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <ComponentLanguageProvider>
                <AuthModalContent onClose={onClose} />
            </ComponentLanguageProvider>
        </div>
    )
}