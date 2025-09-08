import { UploadedFile } from 'express-fileupload';
import * as path from 'path';
import mammoth from 'mammoth';
// Using dynamic import for officeparser as it lacks proper TypeScript typings
import { createRequire } from 'module';
const nodeRequire = createRequire(import.meta.url);
const officeParser = nodeRequire('officeparser');

export async function readFile(file: UploadedFile): Promise<string> {
  const ext = path.extname(file.name).toLowerCase();
  
  if (ext === '.txt') {
    return file.data.toString('utf8');
  }
  
  if (ext === '.docx') {
    const result = await mammoth.extractRawText({ buffer: file.data });
    return result.value;
  }
  
  if (ext === '.doc') {
    return new Promise<string>((resolve, reject) => {
      officeParser.parseWordBuffer(file.data, (err: Error | null, data: string) => {
        if (err) return reject(new Error('Erro ao ler arquivo DOC: ' + err.message));
        resolve(data);
      });
    });
  }
  
  throw new Error('Unsupported file type');
}
