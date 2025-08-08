'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

interface AccordionItemProps {
    question: string;
    children: ReactNode; // Cevap, children olarak gelecek
}

export default function AccordionItem({ question, children }: AccordionItemProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-200 py-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between text-left"
            >
                <span className="text-lg font-medium text-gray-800">{question}</span>
                <ChevronDown
                    className={clsx("h-6 w-6 text-gray-500 transition-transform duration-300", {
                        'rotate-180': isOpen,
                    })}
                />
            </button>
            <div
                className={clsx("overflow-hidden transition-all duration-300 ease-in-out", {
                    'max-h-screen mt-4': isOpen,
                    'max-h-0': !isOpen,
                })}
            >
                <div className="prose prose-sm max-w-none text-gray-600">
                    {children}
                </div>
            </div>
        </div>
    );
}
