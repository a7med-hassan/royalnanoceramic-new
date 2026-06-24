import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * SchemaService
 * ---------------------------------------------------------------------------
 * Manages JSON-LD structured data (<script type="application/ld+json">)
 * injection into the document <head> for SEO.
 *
 * Usage (in any component):
 *   constructor(private schemaService: SchemaService) {}
 *
 *   ngOnInit() {
 *     this.schemaService.addSchema('home-org', { "@context": "...", ... });
 *   }
 *
 *   ngOnDestroy() {
 *     this.schemaService.removeSchema('home-org');
 *   }
 * ---------------------------------------------------------------------------
 */
@Injectable({ providedIn: 'root' })
export class SchemaService {
  /** Prefix used for all script element IDs to avoid collision */
  private readonly ID_PREFIX = 'ld-json-';

  constructor(@Inject(DOCUMENT) private document: Document) {}

  /**
   * Add or replace a JSON-LD schema block in <head>.
   * @param id  Unique identifier for this schema (e.g. 'home-org', 'home-local')
   * @param schema  Plain object representing the schema
   */
  addSchema(id: string, schema: Record<string, unknown>): void {
    const elementId = `${this.ID_PREFIX}${id}`;

    // Remove existing script with the same id if present
    this.removeSchemaById(elementId);

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = elementId;
    script.text = JSON.stringify(schema, null, 2);
    this.document.head.appendChild(script);
  }

  /**
   * Add multiple schemas at once.
   * @param schemas Array of { id, schema } tuples
   */
  addSchemas(schemas: Array<{ id: string; schema: Record<string, unknown> }>): void {
    schemas.forEach(({ id, schema }) => this.addSchema(id, schema));
  }

  /**
   * Remove a previously injected schema by its logical id.
   */
  removeSchema(id: string): void {
    this.removeSchemaById(`${this.ID_PREFIX}${id}`);
  }

  /**
   * Remove multiple schemas at once.
   */
  removeSchemas(ids: string[]): void {
    ids.forEach((id) => this.removeSchema(id));
  }

  // ─── private helpers ────────────────────────────────────────────────────────

  private removeSchemaById(elementId: string): void {
    const existing = this.document.getElementById(elementId);
    if (existing) {
      existing.remove();
    }
  }
}
