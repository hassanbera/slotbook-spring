import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCardModule } from "@angular/material/card";
import {
  Component,
  signal,
  computed,
  inject,
  provideZonelessChangeDetection,
} from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
} from "@angular/common/http";
import { firstValueFrom } from "rxjs";
interface Entity {
  id: string;
  createdAt: string;
}
class Api {
  private http = inject(HttpClient);
  async get<T>(path: string): Promise<T> {
    return (await firstValueFrom(this.http.get<{ data: T }>("/api/" + path)))
      .data;
  }
  async send<T>(method: string, path: string, body: unknown = {}): Promise<T> {
    return (
      await firstValueFrom(
        this.http.request<{ data: T }>(method, "/api/" + path, { body }),
      )
    ).data;
  }
}
interface Employee extends Entity {
  name: string;
  title: string;
  color: string;
}
interface Appointment extends Entity {
  employeeId: string;
  title: string;
  clientName: string;
  clientEmail: string;
  note: string;
  startAt: string;
  endAt: string;
  status: string;
  version: number;
}
@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
  ],
  templateUrl: "./app.html",
  host: { "(document:keydown.escape)": "close()" },
})
class AppComponent {
  error = signal("");
  notice = signal("");
  busy = signal(false);
  panel = signal("");
  query = signal("");
  api = new Api();
  async run(fn: () => Promise<void>) {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set("");
    this.notice.set("");
    try {
      await fn();
    } catch (e) {
      this.error.set(
        e instanceof HttpErrorResponse
          ? e.error?.error ||
              "Sunucuya ulaşılamadı. API bağlantısını kontrol edin."
          : e instanceof Error
            ? e.message
            : "İşlem tamamlanamadı.",
      );
    } finally {
      this.busy.set(false);
    }
  }
  close() {
    this.panel.set("");
  }
  money(c: number) {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(c / 100);
  }
  date(d: string) {
    return new Date(d).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  time(d: string) {
    return new Date(d).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  employees = signal<Employee[]>([]);
  appointments = signal<Appointment[]>([]);
  anchor = signal(this.monday(new Date()));
  employeeFilter = signal("");
  statusFilter = signal("");
  editing: Appointment | null = null;
  employee = { name: "", title: "", color: "#4263eb" };
  form = {
    title: "",
    clientName: "",
    clientEmail: "",
    note: "",
    employeeId: "",
    startAt: "",
    endAt: "",
  };
  days = computed(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(this.anchor());
      d.setDate(d.getDate() + i);
      return d;
    }),
  );
  scheduled = computed(
    () => this.appointments().filter((a) => a.status === "SCHEDULED").length,
  );
  completed = computed(
    () => this.appointments().filter((a) => a.status === "COMPLETED").length,
  );
  constructor() {
    void this.run(() => this.load());
  }
  monday(d: Date) {
    d = new Date(d);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
  }
  local(d: Date) {
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }
  async load() {
    this.employees.set(await this.api.get<Employee[]>("employees"));
    const from = this.anchor().toISOString();
    const end = new Date(this.anchor());
    end.setDate(end.getDate() + 7);
    this.appointments.set(
      await this.api.get<Appointment[]>(
        "appointments?from=" +
          encodeURIComponent(from) +
          "&to=" +
          encodeURIComponent(end.toISOString()),
      ),
    );
  }
  week(n: number) {
    const d = new Date(this.anchor());
    d.setDate(d.getDate() + n * 7);
    this.anchor.set(d);
    void this.run(() => this.load());
  }
  today() {
    this.anchor.set(this.monday(new Date()));
    void this.run(() => this.load());
  }
  onDay(d: Date) {
    return this.appointments().filter(
      (a) =>
        new Date(a.startAt).toDateString() === d.toDateString() &&
        (!this.employeeFilter() || a.employeeId === this.employeeFilter()) &&
        (!this.statusFilter() || a.status === this.statusFilter()) &&
        (a.title + " " + a.clientName)
          .toLocaleLowerCase("tr")
          .includes(this.query().toLocaleLowerCase("tr")),
    );
  }
  isToday(d: Date) {
    return d.toDateString() === new Date().toDateString();
  }
  dayName(d: Date) {
    return d.toLocaleDateString("tr-TR", { weekday: "short" }).toUpperCase();
  }
  employeeName(id: string) {
    return this.employees().find((e) => e.id === id)?.name || "";
  }
  color(id: string) {
    return this.employees().find((e) => e.id === id)?.color || "#4263eb";
  }
  newAppointment(d?: Date) {
    this.editing = null;
    const start = new Date(d || new Date());
    start.setHours(10, 0, 0, 0);
    this.form = {
      title: "",
      clientName: "",
      clientEmail: "",
      note: "",
      employeeId: this.employees()[0]?.id || "",
      startAt: this.local(start),
      endAt: this.local(new Date(start.getTime() + 3600000)),
    };
    this.panel.set("appointment");
  }
  edit(a: Appointment) {
    this.editing = a;
    this.form = {
      title: a.title,
      clientName: a.clientName,
      clientEmail: a.clientEmail,
      note: a.note,
      employeeId: a.employeeId,
      startAt: this.local(new Date(a.startAt)),
      endAt: this.local(new Date(a.endAt)),
    };
    this.panel.set("appointment");
  }
  saveEmployee() {
    void this.run(async () => {
      await this.api.send("POST", "employees", this.employee);
      await this.load();
      this.close();
      this.employee = { ...this.employee, name: "", title: "" };
    });
  }
  save() {
    void this.run(async () => {
      const data = {
        ...this.form,
        startAt: new Date(this.form.startAt).toISOString(),
        endAt: new Date(this.form.endAt).toISOString(),
        ...(this.editing ? { version: this.editing.version } : {}),
      };
      await this.api.send(
        this.editing ? "PUT" : "POST",
        this.editing ? "appointments/" + this.editing.id : "appointments",
        data,
      );
      await this.load();
      this.close();
      this.notice.set("Randevu kaydedildi.");
    });
  }
  status(value: string) {
    if (!this.editing) return;
    void this.run(async () => {
      await this.api.send(
        "PATCH",
        "appointments/" + this.editing!.id + "/status",
        { status: value, version: this.editing!.version },
      );
      await this.load();
      this.close();
    });
  }
}
bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(), provideZonelessChangeDetection()],
}).catch(console.error);
