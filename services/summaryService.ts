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
    return 'NOT IMPLEMENTED'; // Implementar chamada ao Gemini
}

export function validateFile(file: UploadedFile): void {
    // const extension = path.extname(file.name).toLowerCase();
    // const MAX_FILE_SIZE = 1024 * 1024; // 1MB

   throw new Error('Not implemented'); // Implementar validação de arquivo
}
