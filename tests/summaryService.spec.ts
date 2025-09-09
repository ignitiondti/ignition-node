import { validateFile, summarizeFile } from '../services/summaryService.ts';
import * as fileService from '../services/fileService.ts';
import * as geminiService from '../services/geminiService.ts';
import { UploadedFile } from 'express-fileupload';

jest.mock('../services/fileService.ts', () => ({
  readFile: jest.fn().mockResolvedValue('Texto de teste')
}));
jest.mock('../services/geminiService.ts', () => ({
  generateContentFromGemini: jest.fn().mockResolvedValue('Resumo gerado')
}));

describe('Serviço de Resumo', () => {
  describe('validateFile', () => {
    it('deve aceitar arquivo txt válido menor que 1MB', () => {
      const file = { name: 'test.txt', data: Buffer.from('Hello World') } as UploadedFile;
      expect(() => validateFile(file)).not.toThrow();
    });
    it('deve aceitar arquivo docx válido menor que 1MB', () => {
      const file = { name: 'test.docx', data: Buffer.from('Hello World') } as UploadedFile;
      expect(() => validateFile(file)).not.toThrow();
    });
    it('deve rejeitar arquivos com extensões inválidas', () => {
      throw new Error('Not implemented');      // Implementar este teste
    });
    it('deve rejeitar arquivos vazios', () => {
      const file = { name: 'test.txt', data: Buffer.from('') } as UploadedFile;
      // Add expect clause
      throw new Error('Not implemented');
    });
    it('deve rejeitar arquivos com data nulo', () => {
      const file = { name: 'test.txt', data: null } as unknown as UploadedFile;
      // Add expect clause
      throw new Error('Not implemented');
    });
    it('deve rejeitar arquivos maiores que 1MB', () => {
      const file = { name: 'test.txt', data: Buffer.alloc(1024 * 1024 + 1) } as UploadedFile;
      // Add expect clause
      throw new Error('Not implemented');
    });
    it('deve rejeitar arquivo sem data', () => {
      const file = { name: 'test.txt' } as unknown as UploadedFile;
      // Add expect clause
      throw new Error('Not implemented');
    });
  });

  describe('summarizeFile', () => {
    const file: UploadedFile = { name: 'test.txt', data: Buffer.from('Texto de teste') } as UploadedFile;

    it('deve retornar resumo para arquivo válido', async () => {
      const summary = await summarizeFile(file);
      expect(summary).toBe('Resumo gerado');
      expect(fileService.readFile).toHaveBeenCalledWith(file);
      expect(geminiService.generateContentFromGemini).toHaveBeenCalledWith(expect.stringContaining('Texto de teste'));
    });
  });
});
