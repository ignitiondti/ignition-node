import { UploadedFile } from 'express-fileupload';
import * as path from 'path';
import mammoth from 'mammoth';

export async function readFile(file: UploadedFile): Promise<string> {
  const ext = path.extname(file.name).toLowerCase();
  
  if (ext === '.txt') {
    return file.data.toString('utf8');
  }
  
  if (ext === '.docx') {
    const result = await mammoth.extractRawText({ buffer: file.data });
    return result.value;
  }
  
  throw new Error('Unsupported file type. Only .txt and .docx files are supported.');
}
