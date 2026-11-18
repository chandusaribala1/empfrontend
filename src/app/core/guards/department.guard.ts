import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, Router } from "@angular/router";
import { DepartmentService } from "../services/department.service";

@Injectable({ providedIn: "root" })
export class DepartmentGuard implements CanActivate {
  constructor(
    private departmentService: DepartmentService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const id = Number(route.paramMap.get("id"));
    if (!Number.isInteger(id) || id <= 0) {
      this.router.navigate(["/departments"]);
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      this.departmentService.get(id).subscribe({
        next: () => resolve(true),
        error: () => {
          this.router.navigate(["/departments"]);
          resolve(false);
        },
      });
    });
  }
}
