export type ToolsConverterKind = 'cbm' | 'length' | 'liquid' | 'volume' | 'weight';

function converterPath(base: string, kind: ToolsConverterKind): string {
  return `${base}/converter/${kind}`;
}

export const STAFF_TOOLS_API = {
  converter: (kind: ToolsConverterKind) => converterPath('/tools', kind),
} as const;

export const VENDOR_TOOLS_API = {
  converter: (kind: ToolsConverterKind) => converterPath('/vendor/tools', kind),
} as const;

export const PORTAL_TOOLS_API = {
  converter: (kind: ToolsConverterKind) => converterPath('/portal/tools', kind),
} as const;
