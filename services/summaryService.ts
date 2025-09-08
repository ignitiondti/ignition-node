import * as path from 'path';
import { UploadedFile } from 'express-fileupload';
import { readFile } from './fileService.ts';
import { generateContentFromGemini } from './geminiService.ts';


export async function summarizeFile(file: UploadedFile): Promise<string> {
    validateFile(file);
    const text = await readFile(file);
    if (!text || text.trim().length === 0) {
        throw new Error('File contains no readable text');
    }
    const prompt = `Resuma o seguinte texto de forma concisa:\n\n${text}`;
    return await generateContentFromGemini(prompt);
}

export function validateFile(file: UploadedFile): void {
    const allowedExt = ['.txt', '.doc', '.docx'];
    const ext = path.extname(file.name).toLowerCase();

    if (!allowedExt.includes(ext)) {
        throw new Error('Invalid file extension. Allowed: .doc, .docx, .txt');
    }
    if (!file.data || file.data.length === 0) {
        throw new Error('File content is empty');
    }
    if (file.data.length > 1024 * 1024) {
        throw new Error('File size exceeds 1MB');
    }
}
