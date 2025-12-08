import * as fs from 'fs';
import * as path from 'path';

// @ts-ignore
const pdf = require('pdf-parse');

async function convertPdfToMarkdown(pdfPath: string, outputPath: string) {
  try {
    console.log('Reading PDF file...');
    const dataBuffer = fs.readFileSync(pdfPath);

    console.log('Parsing PDF...');
    const data = await pdf(dataBuffer);

    // Extract text content
    let markdown = data.text;

    // Basic formatting improvements
    // Remove excessive blank lines
    markdown = markdown.replace(/\n{3,}/g, '\n\n');

    // Add proper code block formatting for code sections
    markdown = markdown.replace(/^(import .+)$/gm, '```typescript\n$1\n```');
    markdown = markdown.replace(/^(const .+)$/gm, '```typescript\n$1\n```');
    markdown = markdown.replace(/^(npm .+)$/gm, '```bash\n$1\n```');
    markdown = markdown.replace(/^(PRIVATE_KEY=.+)$/gm, '```bash\n$1\n```');

    // Format JSON blocks
    markdown = markdown.replace(/(\{[\s\S]*?\})/g, (match: string) => {
      if (match.includes('\n')) {
        return '```json\n' + match + '\n```';
      }
      return match;
    });

    // Format endpoints
    markdown = markdown.replace(/^(GET|POST|PUT|DELETE) (.+)$/gm, '**$1** `$2`');

    console.log('Writing markdown file...');
    fs.writeFileSync(outputPath, markdown, 'utf-8');

    console.log(`✓ Successfully converted PDF to markdown: ${outputPath}`);
    console.log(`  Pages: ${data.numpages}`);
    console.log(`  Text length: ${data.text.length} characters`);

  } catch (error) {
    console.error('Error converting PDF to markdown:', error);
    throw error;
  }
}

// Main execution
const pdfPath = path.join(__dirname, '../Markdown to PDF.pdf');
const outputPath = path.join(__dirname, '../browserbase-x402.md');

convertPdfToMarkdown(pdfPath, outputPath)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
