import { UploadedFile } from 'express-fileupload';

// TODO (Phase 3): define this interface to match SPEC.md §2.3 exactly.
export interface SummaryResult {
  summary: string;
  originalLength: number;
  summaryLength: number;
  language: string;
  model: string;
  processingTimeMs: number;
}

// TODO (Phase 3): define this interface for validated request params.
export interface SummaryParams {
  maxLength: number;
  language: string;
}

/**
 * validateFile
 *
 * TODO (Phase 3 — implement ALL checks from SPEC.md §3 in this order):
 *  1. Size check   → AppError FILE_TOO_LARGE (413)       SPEC §3.2
 *  2. Extension    → AppError UNSUPPORTED_MEDIA_TYPE (415) SPEC §3.3
 *  3. MIME check   → AppError UNSUPPORTED_MEDIA_TYPE (415) SPEC §3.3
 *  4. MIME+ext cross-check → same error code             SPEC §3.3
 *  5. Empty buffer → AppError EMPTY_FILE (400)           SPEC §3.4
 *
 * Important: the size check MUST run before extension/MIME checks.
 * Throw an AppError (not a plain Error) for every failure case.
 */
export function validateFile(_file: UploadedFile): void {
  // STUB — implement me
  throw new Error('validateFile not implemented');
}

/**
 * summarizeFile
 *
 * TODO (Phase 3 — implement):
 *  1. Call validateFile(file)
 *  2. Extract text via fileService.readFile(file)
 *  3. Check extracted text is not blank → AppError EMPTY_FILE (400)
 *  4. Start processingTimeMs timer
 *  5. Call geminiService.generateContentFromGemini({ text, maxLength, language })
 *  6. Stop timer
 *  7. Return a SummaryResult object with all 6 fields (SPEC.md §2.3)
 */
export async function summarizeFile(
  _file: UploadedFile,
  _params: SummaryParams,
): Promise<SummaryResult> {
  // STUB — implement me
  throw new Error('summarizeFile not implemented');
}
