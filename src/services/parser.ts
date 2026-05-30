import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export async function parsePdf(buffer: Buffer): Promise<string> {
  try {
    const result = await pdf(buffer);
    return result.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF document.');
  }
}

export async function parseDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse DOCX document.');
  }
}

export async function parseDocument(buffer: Buffer, fileType: 'PDF' | 'DOCX'): Promise<string> {
  if (fileType === 'PDF') {
    return parsePdf(buffer);
  } else if (fileType === 'DOCX') {
    return parseDocx(buffer);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or DOCX.');
  }
}
