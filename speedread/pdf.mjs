export async function extractPdf(file) {
  const { getDocument, GlobalWorkerOptions } = await import('./vendor/pdfjs/pdf.min.mjs');
  const assets = new URL('./vendor/pdfjs/', import.meta.url);
  GlobalWorkerOptions.workerSrc = new URL('pdf.worker.min.mjs', assets).href;
  const task = getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    cMapUrl: new URL('cmaps/', assets).href,
    standardFontDataUrl: new URL('standard_fonts/', assets).href,
    useWasm: false,
    disableFontFace: true,
  });
  try {
    const pdf = await task.promise;
    let text = '';
    for (let number = 1; number <= pdf.numPages; number++) {
      const page = await pdf.getPage(number);
      const content = await page.getTextContent();
      // PDF.js supplies spaces, including between items with different fonts.
      for (const item of content.items) {
        if (typeof item.str !== 'string') continue;
        text += item.str + (item.hasEOL ? '\n' : '');
        if (text.length > 2_000_000) {
          throw new Error('This PDF has too much text. Choose a section under 2 million characters.');
        }
      }
      text += '\n\n';
      page.cleanup();
    }
    text = text.trim();
    if (!text) throw new Error('No selectable text found. Scanned PDFs need OCR before importing.');
    return text;
  } catch (error) {
    if (error.name === 'PasswordException') {
      throw new Error('This PDF is password-protected. Open an unlocked copy or paste its text.');
    }
    if (error.name === 'InvalidPDFException') {
      throw new Error('This PDF could not be read. It may be damaged; try another copy or paste its text.');
    }
    throw error;
  } finally {
    await task.destroy();
  }
}
