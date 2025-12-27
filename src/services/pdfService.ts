import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

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

export async function extractTextFromDoc(file: File): Promise<string> {
    try {
        // Note: mammoth primarily supports DOCX format
        // For older .doc files, we attempt extraction but it may not work perfectly
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });

        if (!result.value || result.value.trim().length === 0) {
            throw new Error('Không thể trích xuất văn bản từ file DOC. Vui lòng chuyển đổi sang định dạng DOCX.');
        }

        return result.value;
    } catch (error) {
        throw new Error(`Không thể đọc file DOC: ${error instanceof Error ? error.message : 'Unknown error'}. Vui lòng thử chuyển đổi sang DOCX.`);
    }
}

export async function extractTextFromDocx(file: File): Promise<string> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    } catch (error) {
        throw new Error(`Không thể đọc file DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function extractTextFromImage(
    file: File,
    apiKey?: string,
    provider?: 'openai' | 'gemini'
): Promise<string> {
    try {
        // Use provided parameters or fall back to localStorage
        let finalApiKey = apiKey;
        let finalProvider = provider;

        if (!finalApiKey || !finalProvider) {
            const settingsStr = localStorage.getItem('settings');
            if (!settingsStr) {
                throw new Error('Vui lòng cấu hình API key trong phần Cài đặt trước khi sử dụng tính năng OCR.');
            }

            const settings = JSON.parse(settingsStr);
            finalApiKey = finalApiKey || settings.apiKey;
            finalProvider = finalProvider || settings.apiProvider || 'gemini';
        }

        if (!finalApiKey) {
            throw new Error('API key chưa được cấu hình. Vui lòng vào Cài đặt để nhập API key.');
        }

        // Convert image to base64
        const base64Image = await fileToBase64(file);

        if (finalProvider === 'openai') {
            return await extractTextWithOpenAIVision(base64Image, finalApiKey, file.type);
        } else {
            return await extractTextWithGeminiVision(base64Image, finalApiKey, file.type);
        }
    } catch (error) {
        throw new Error(`Không thể trích xuất văn bản từ hình ảnh: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Helper function to convert file to base64
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            // Remove data URL prefix (e.g., "data:image/png;base64,")
            const base64Data = base64.split(',')[1];
            resolve(base64Data);
        };
        reader.onerror = () => reject(new Error('Không thể đọc file hình ảnh'));
        reader.readAsDataURL(file);
    });
}

// Extract text using OpenAI Vision API
async function extractTextWithOpenAIVision(base64Image: string, apiKey: string, mimeType: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Hãy trích xuất TẤT CẢ văn bản có trong hình ảnh này. Trả về văn bản thuần túy, giữ nguyên định dạng và cấu trúc. Nếu là hợp đồng hoặc tài liệu pháp lý, hãy đảm bảo trích xuất chính xác mọi chi tiết.'
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${mimeType};base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 4096,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Lỗi khi gọi OpenAI Vision API');
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

// Extract text using Gemini Vision API
async function extractTextWithGeminiVision(base64Image: string, apiKey: string, mimeType: string): Promise<string> {
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [
                    {
                        text: 'Hãy trích xuất TẤT CẢ văn bản có trong hình ảnh này. Trả về văn bản thuần túy, giữ nguyên định dạng và cấu trúc. Nếu là hợp đồng hoặc tài liệu pháp lý, hãy đảm bảo trích xuất chính xác mọi chi tiết.'
                    },
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: base64Image
                        }
                    }
                ]
            }],
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 8192,
            },
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Lỗi khi gọi Gemini Vision API');
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}


export async function extractTextFromFile(
    file: File,
    apiKey?: string,
    provider?: 'openai' | 'gemini'
): Promise<string> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'pdf':
            return extractTextFromPDF(file);
        case 'txt':
            return extractTextFromTxt(file);
        case 'doc':
            return extractTextFromDoc(file);
        case 'docx':
            return extractTextFromDocx(file);
        case 'png':
            return extractTextFromImage(file, apiKey, provider);
        case 'jpg':
            return extractTextFromImage(file, apiKey, provider);
        case 'jpeg':
            return extractTextFromImage(file, apiKey, provider);
        default:
            throw new Error(`Không hỗ trợ định dạng file: ${extension}`);
    }
}
