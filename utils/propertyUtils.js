import fs from 'fs';
import path from 'path';

export function getPropertyName() {
  // Build path to downloads/property.json
  const filePath = path.join(process.cwd(), 'downloads', 'property.json');

  // Read from the correct file
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);

  return data.propertyName;
}
