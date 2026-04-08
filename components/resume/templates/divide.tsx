import type { TemplateProps } from "./classic";
import { ColumnBase } from "./column-base";

export function DivideTemplate(props: TemplateProps) {
  return (
    <ColumnBase
      {...props}
      leftBackground="white"
      showDivider={true}
    />
  );
}
