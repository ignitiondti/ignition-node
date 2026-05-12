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
