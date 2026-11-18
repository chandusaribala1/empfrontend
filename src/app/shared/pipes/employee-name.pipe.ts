import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "employeeName", standalone: true })
export class EmployeeNamePipe implements PipeTransform {
  transform(
    name: string | null | undefined,
    format: "title" | "uppercase" = "title",
  ): string {
    if (!name) return "";
    if (format === "uppercase") return name.toLocaleUpperCase();
    return name
      .trim()
      .toLocaleLowerCase()
      .replace(/(^|\s)\S/g, (letter) => letter.toLocaleUpperCase());
  }
}
//CHANDANA
//Chandana
