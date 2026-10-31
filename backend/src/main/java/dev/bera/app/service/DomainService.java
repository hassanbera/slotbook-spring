package dev.bera.app.service;

import static dev.bera.app.common.Input.*;

import com.fasterxml.jackson.databind.*;
import dev.bera.app.common.*;
import dev.bera.app.model.*;
import dev.bera.app.repository.*;
import java.time.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DomainService {

  private final EmployeeRepository employees;
  private final AppointmentRepository appointments;

  public DomainService(
    EmployeeRepository employees,
    AppointmentRepository appointments
  ) {
    this.employees = employees;
    this.appointments = appointments;
  }

  public List<Employee> employees() {
    return employees.findAll(org.springframework.data.domain.Sort.by("name"));
  }

  @Transactional
  public Employee employee(JsonNode j) {
    var e = new Employee();
    e.name = text(j, "name", 80, true);
    e.title = text(j, "title", 80, false);
    e.color = text(j, "color", 20, true);
    if (!e.color.matches("#[a-fA-F0-9]{6}")) throw new ApiException(
      400,
      "Renk geÃ§ersiz."
    );
    return employees.save(e);
  }

  public List<Appointment> appointments(String from, String to) {
    Instant f, t;
    try {
      f = Instant.parse(from);
      t = Instant.parse(to);
    } catch (Exception e) {
      throw new ApiException(400, "GeÃ§ersiz tarih aralÄ±ÄŸÄ±.");
    }
    if (
      !t.isAfter(f) || Duration.between(f, t).compareTo(Duration.ofDays(31)) > 0
    ) throw new ApiException(400, "AralÄ±k 1â€“31 gÃ¼n olmalÄ±.");
    return appointments.findByStartAtLessThanAndEndAtGreaterThanOrderByStartAt(
      t,
      f
    );
  }

  @Transactional
  public Appointment create(JsonNode j) {
    var a = new Appointment();
    apply(a, j);
    return appointments.saveAndFlush(a);
  }

  @Transactional
  public Appointment update(UUID id, JsonNode j) {
    var a = found(appointments.lock(id));
    checkVersion(a, j);
    if (!a.status.equals("SCHEDULED")) throw new ApiException(
      409,
      "YalnÄ±zca planlanmÄ±ÅŸ randevu dÃ¼zenlenebilir."
    );
    apply(a, j);
    a.version++;
    return appointments.saveAndFlush(a);
  }

  @Transactional
  public Appointment status(UUID id, JsonNode j) {
    var a = found(appointments.lock(id));
    checkVersion(a, j);
    if (!a.status.equals("SCHEDULED")) throw new ApiException(
      409,
      "Randevu artÄ±k deÄŸiÅŸtirilemez."
    );
    a.status = choice(j, "status", "COMPLETED", "CANCELLED");
    a.version++;
    return appointments.saveAndFlush(a);
  }

  private void checkVersion(Appointment a, JsonNode j) {
    if (
      a.version != number(j, "version", 1, Integer.MAX_VALUE)
    ) throw new ApiException(409, "KayÄ±t deÄŸiÅŸmiÅŸ; yeniden yÃ¼kleyin.");
  }

  private void apply(Appointment a, JsonNode j) {
    a.title = text(j, "title", 120, true);
    a.clientName = text(j, "clientName", 100, true);
    a.clientEmail = email(j);
    a.note = text(j, "note", 1500, false);
    a.employeeId = id(j, "employeeId");
    found(employees.findById(a.employeeId));
    a.startAt = instant(j, "startAt");
    a.endAt = instant(j, "endAt");
    if (
      !a.endAt.isAfter(a.startAt) ||
      Duration.between(a.startAt, a.endAt).compareTo(Duration.ofHours(12)) > 0
    ) throw new ApiException(400, "Randevu sÃ¼resi 0â€“12 saat olmalÄ±.");
  }
}
