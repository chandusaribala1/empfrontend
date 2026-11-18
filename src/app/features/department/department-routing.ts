import { Routes } from "@angular/router";
import { DepartmentGuard } from "../../core/guards/department.guard";
import { departmentExitGuard } from "../../core/guards/department-exit.guard";

export const departmentRoutes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./department.component").then((page) => page.DepartmentComponent),
    canDeactivate: [departmentExitGuard],
  },
  {
    path: ":id",
    loadComponent: () =>
      import("./department.component").then((page) => page.DepartmentComponent),
    canActivate: [DepartmentGuard],
    canDeactivate: [departmentExitGuard],
  },
];
