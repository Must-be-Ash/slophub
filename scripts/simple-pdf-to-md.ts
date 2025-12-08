/**
 * Simple PDF to Markdown converter
 *
 * This script provides a manual approach to converting PDFs to Markdown.
 * Since automated PDF parsing can be unreliable, this script guides you through
 * the process of extracting and formatting content.
 *
 * Usage:
 *   1. Copy your PDF text (using Preview, Adobe Reader, etc.)
 *   2. Paste it into a .txt file
 *   3. Run: npx tsx scripts/simple-pdf-to-md.ts <input.txt> <output.md>
 */

import * as fs from 'fs';
import * as path from 'path';

function formatAsMarkdown(text: string): string {
  let markdown = text;

  // Remove excessive blank lines
  markdown = markdown.replace(/\n{3,}/g, '\n\n');

  // Format code blocks - detect common patterns
  const codePatterns = [
    { regex: /^(import\s+.+)$/gm, lang: 'typescript' },
    { regex: /^(export\s+.+)$/gm, lang: 'typescript' },
    { regex: /^(const\s+.+=.+)$/gm, lang: 'typescript' },
    { regex: /^(npm\s+.+)$/gm, lang: 'bash' },
    { regex: /^(npx\s+.+)$/gm, lang: 'bash' },
    { regex: /^(PRIVATE_KEY=.+)$/gm, lang: 'bash' },
  ];

  // Format headers
  markdown = markdown.replace(/^([A-Z][A-Za-z\s]+)$/gm, '## $1');

  // Format endpoints (GET, POST, etc.)
  markdown = markdown.replace(/^(GET|POST|PUT|DELETE|PATCH)\s+(.+)$/gm, '\n**$1** `$2`\n');

  // Wrap URLs in markdown link format
  markdown = markdown.replace(/(https?:\/\/[^\s]+)/g, '[$1]($1)');

  return markdown;
}

function convertToMarkdown(inputPath: string, outputPath: string): void {
  try {
    console.log('Reading input file:', inputPath);
    const text = fs.readFileSync(inputPath, 'utf-8');

    console.log('Formatting as markdown...');
    const markdown = formatAsMarkdown(text);

    console.log('Writing output file:', outputPath);
    fs.writeFileSync(outputPath, markdown, 'utf-8');

    console.log('✓ Successfully converted to markdown');
    console.log('  Input:', inputPath);
    console.log('  Output:', outputPath);
    console.log('  Length:', markdown.length, 'characters');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.error('Usage: npx tsx scripts/simple-pdf-to-md.ts <input.txt> <output.md>');
  console.error('');
  console.error('Example:');
  console.error('  1. Copy text from your PDF');
  console.error('  2. Save to a .txt file');
  console.error('  3. Run: npx tsx scripts/simple-pdf-to-md.ts input.txt output.md');
  process.exit(1);
}

const [inputPath, outputPath] = args.map(p => path.resolve(p));

convertToMarkdown(inputPath, outputPath);
