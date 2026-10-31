package dev.bera.app.model;

import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "employees")
public class Employee {

  @Id
  public UUID id = UUID.randomUUID();

  @Column(nullable = false)
  public Instant createdAt = Instant.now();

  @Column(name = "name", length = 80)
  public String name = "";

  @Column(name = "title", length = 80)
  public String title = "";

  @Column(name = "color", length = 20)
  public String color = "#4263eb";
}
