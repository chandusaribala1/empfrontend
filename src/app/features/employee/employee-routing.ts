import { Routes } from "@angular/router";

export const employeeRoutes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./employee.component")
          .then((page) => page.EmployeeComponent),
  },
];
