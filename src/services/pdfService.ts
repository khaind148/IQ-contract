import * as pdfjsLib from 'pdfjs-dist';

import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function extractTextFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: unknown) => {
                const textItem = item as { str?: string };
                return textItem.str || '';
            })
            .join(' ');
        fullText += pageText + '\n\n';
    }

    return fullText.trim();
}

export function extractTextFromTxt(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            resolve(text);
        };
        reader.onerror = () => reject(new Error('Không thể đọc file'));
        reader.readAsText(file);
    });
}

export async function extractTextFromFile(file: File): Promise<string> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'pdf':
            return extractTextFromPDF(file);
        case 'txt':
            return extractTextFromTxt(file);
        default:
            throw new Error(`Không hỗ trợ định dạng file: ${extension}`);
    }
}
