package dev.bera.app.model;

import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "appointments")
public class Appointment {

  @Id
  public UUID id = UUID.randomUUID();

  @Column(nullable = false)
  public Instant createdAt = Instant.now();

  @Column(name = "employee_id")
  public UUID employeeId = null;

  @Column(name = "title", length = 120)
  public String title = "";

  @Column(name = "client_name", length = 100)
  public String clientName = "";

  @Column(name = "client_email", length = 200)
  public String clientEmail = "";

  @Column(name = "note", length = 1500)
  public String note = "";

  @Column(name = "start_at")
  public Instant startAt = Instant.now();

  @Column(name = "end_at")
  public Instant endAt = Instant.now();

  @Column(name = "status", length = 20)
  public String status = "SCHEDULED";

  @Column(name = "version")
  public int version = 1;
}
