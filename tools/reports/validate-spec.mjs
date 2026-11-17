/**
 * Validate a draft spec against reports/spec.schema.json.
 * Run: node tools/reports/validate-spec.mjs reports/specs/<code>.json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const schema = JSON.parse(fs.readFileSync(path.join(root, 'reports/spec.schema.json'), 'utf8'));

function check(value, rule, pointer, errors) {
  if (!rule) return;
  if (rule.type) {
    const types = Array.isArray(rule.type) ? rule.type : [rule.type];
    const actual = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
    if (!types.includes(actual)) {
      errors.push(`${pointer} expected ${types.join('|')} but was ${actual}`);
      return;
    }
  }
  if (typeof value === 'string' && rule.minLength && value.length < rule.minLength) {
    errors.push(`${pointer} is shorter than ${rule.minLength}`);
  }
  if (typeof value === 'number' && rule.exclusiveMinimum != null && value <= rule.exclusiveMinimum) {
    errors.push(`${pointer} must be greater than ${rule.exclusiveMinimum}`);
  }
  if (rule.enum && !rule.enum.includes(value)) {
    errors.push(`${pointer} must be one of ${rule.enum.join(', ')}`);
  }
  if (rule.required && value && typeof value === 'object' && !Array.isArray(value)) {
    for (const key of rule.required) {
      if (!(key in value)) errors.push(`${pointer}.${key} is required`);
    }
  }
  if (rule.properties && value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(rule.properties)) {
      if (key in value) check(value[key], child, `${pointer}.${key}`, errors);
    }
  }
  if (rule.items && Array.isArray(value)) {
    value.forEach((item, index) => check(item, rule.items, `${pointer}[${index}]`, errors));
  }
  if (rule.additionalProperties && rule.additionalProperties !== true && value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (!rule.properties || !(key in rule.properties)) {
        check(child, rule.additionalProperties, `${pointer}.${key}`, errors);
      }
    }
  }
}

export function validateSpec(spec) {
  const errors = [];
  check(spec, schema, '$', errors);
  return errors;
}

const file = process.argv[2];
if (file && process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
  const errors = validateSpec(spec);
  if (errors.length) {
    console.error(errors.slice(0, 30).join('\n'));
    process.exit(1);
  }
  console.log(`${path.basename(file)} valid (${errors.length} errors)`);
}
