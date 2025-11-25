import fs from 'fs';

export function getPropertyName() {
  const rawData = fs.readFileSync('property.json', 'utf-8');
  const data = JSON.parse(rawData);
  return data.propertyName;
}
