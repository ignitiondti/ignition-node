import { Request, Response, RequestHandler } from 'express';
import { UploadedFile } from 'express-fileupload';
import { summarizeFile } from '../services/summaryService.ts';

// TODO (Phase 3): Replace FileRequest with a proper typed interface that
// includes maxLength and language query/body parameters.
interface FileRequest extends Request {
  files?: {
    file: UploadedFile;
  };
}

type SummaryController = {
  summarize: RequestHandler;
};

const summaryController: SummaryController = {
  /**
   * POST /api/v1/summarize
   *
   * TODO (Phase 3 — implement all of the following):
   *  1. Validate that req.files.file exists → 400 / NO_FILE
   *  2. Parse and validate optional `maxLength` parameter (50–2000, default 300)
   *  3. Parse and validate optional `language` parameter (BCP-47, default pt-BR)
   *  4. Call summarizeFile() with file + params
   *  5. Return the full 6-field response object (see SPEC.md §2.3)
   *  6. Map AppError instances to their correct HTTP status codes
   *  7. Map unknown errors to 500 / INTERNAL_ERROR (do NOT expose error.message)
   *  8. Add Swagger JSDoc to routes/index.ts for this endpoint
   */
  summarize: async (_req: Request, res: Response): Promise<void> => {
    // STUB — replace this entire handler
    res.status(501).json({
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'This endpoint has not been implemented yet.',
      },
    });
  },
};

export default summaryController;
