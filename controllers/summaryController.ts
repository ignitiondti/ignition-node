import { Request, Response, RequestHandler } from 'express';
import { UploadedFile } from 'express-fileupload';
import { summarizeFile } from '../services/summaryService.ts';

interface FileRequest extends Request {
  files?: {
    file: UploadedFile;
  };
}

type SummaryController = {
  summarize: RequestHandler;
};

const summaryController: SummaryController = {
  summarize: async (req: Request, res: Response): Promise<void> => {
    try {
      const fileRequest = req as FileRequest;
      if (!fileRequest.files || !fileRequest.files.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }
      const file = fileRequest.files.file;
      const summary = await summarizeFile(file);
      res.json({ summary });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }
};

export default summaryController;
