import express from 'express';
import summaryController from '../controllers/summaryController.ts';

const router = express.Router();

/**
 * @swagger
 * /summarize:
 *   post:
 *     summary: Resume um arquivo (.txt, .docx) usando Gemini
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo para resumir (.txt, .docx)
 *     responses:
 *       200:
 *         description: Resumo gerado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: string
 *       400:
 *         description: Nenhum arquivo enviado
 *       500:
 *         description: Erro interno
 */
router.post('/summarize', summaryController.summarize);

export default router;
