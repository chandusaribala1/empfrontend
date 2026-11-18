import { CanDeactivateFn } from "@angular/router";
import { DepartmentComponent } from "../../features/department/department.component";

export const departmentExitGuard: CanDeactivateFn<DepartmentComponent> = (
  component,
) =>
  component.hasUnsavedChanges()
    ? window.confirm("Discard unsaved department changes?")
    : true;
