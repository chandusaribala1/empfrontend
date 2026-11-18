import { Routes } from "@angular/router";
import { LayoutComponent } from "./core/layout/layout.component";
import { adminGuard, employeeGuard, signedInGuard } from "./core/guards/auth.guards";

export const appRoutes: Routes = [
  {
    path: "login",
    loadComponent: () => import("./features/auth/login/login.component").then((page) => page.LoginComponent),
  },
  {
    path: "register",
    loadComponent: () => import("./features/auth/register/register.component").then((page) => page.RegisterComponent),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [signedInGuard],
    children: [
      {
        path: '',
        pathMatch: "full",
        redirectTo: "employees"
      },
      {
        path: "employees",
        canActivate: [adminGuard],
        loadChildren: () =>
          import("./features/employee/employee-routing")
              .then((routes) => routes.employeeRoutes,
          ),
      },
      {
        path: "departments",
        canActivate: [adminGuard],
        loadChildren: () =>
          import("./features/department/department-routing").then(
            (routes) => routes.departmentRoutes,
          ),
      },
      {
        path: "my-details",
        canActivate: [employeeGuard],
        loadComponent: () => import("./features/employee/my-details/my-details.component").then((page) => page.MyDetailsComponent),
      },
        // wildcard fallback-->type url doesnt match it redirect to the employee page
      {
        path: "**",
        redirectTo: "login"
      },
    ],
  },
];
