
import React from "react";
import SchemaExplorer from "./SchemaExplorer";

interface Table {
  name: string;
  columns: string[];
  description?: string;
  owner?: string;
  rowsSample?: any[];
}

interface SchemaType {
  schema: string;
  tables: Table[];
}

interface SchemaExplorerListProps {
  schemas: SchemaType[];
  openSchemas: Record<string, boolean>;
  onToggleOpen: (schema: string) => void;
  onInsertSchemaTable?: (schema: string, table: string) => void;
  onInsertColumn?: (col: string) => void;
}

const SchemaExplorerList: React.FC<SchemaExplorerListProps> = ({
  schemas,
  openSchemas,
  onToggleOpen,
  onInsertSchemaTable,
  onInsertColumn,
}) => (
  <ul className="space-y-2 flex-1 overflow-y-auto px-2">
    {schemas.map((schema) => (
      <li key={schema.schema}>
        <SchemaExplorer
          schemaName={schema.schema}
          tables={schema.tables}
          open={openSchemas[schema.schema]}
          onToggleOpen={onToggleOpen}
          onInsertSchemaTable={onInsertSchemaTable}
          onInsertColumn={onInsertColumn}
        />
      </li>
    ))}
  </ul>
);

export default SchemaExplorerList;
