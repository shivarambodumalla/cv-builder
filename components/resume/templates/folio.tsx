import type { TemplateProps } from "./classic";
import { ColumnBase } from "./column-base";

export function FolioTemplate(props: TemplateProps) {
  return (
    <ColumnBase
      {...props}
      leftBackground="#F1F5F9"
      showDivider={false}
    />
  );
}
