import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-department-form",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./department-form.component.html",
})
export class DepartmentFormComponent {
  @Input() name = "";
  @Output() nameChange = new EventEmitter<string>();
  @Output() createRequested = new EventEmitter<void>();

  updateName(value: string): void {
    this.nameChange.emit(value);
  }

  create(): void {
    this.createRequested.emit();
  }
}
