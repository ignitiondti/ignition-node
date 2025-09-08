declare module 'mammoth' {
    interface ExtractResult {
        value: string;
        messages: any[];
    }

    interface ExtractOptions {
        buffer: Buffer;
    }

    export function extractRawText(options: ExtractOptions): Promise<ExtractResult>;
}
