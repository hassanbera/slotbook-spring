package dev.bera.app.controller;

import com.fasterxml.jackson.databind.JsonNode;
import dev.bera.app.service.DomainService;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ApiController {

  private final DomainService service;
  private final JdbcTemplate db;

  public ApiController(DomainService service, JdbcTemplate db) {
    this.service = service;
    this.db = db;
  }

  @GetMapping("/health")
  public Object health() {
    db.queryForObject("SELECT 1", Integer.class);
    return Map.of("data", Map.of("status", "ok"));
  }

  @GetMapping("/employees")
  public Object action0() {
    return Map.of("data", service.employees());
  }

  @PostMapping("/employees")
  public Object action1(@RequestBody JsonNode j) {
    return Map.of("data", service.employee(j));
  }

  @GetMapping("/appointments")
  public Object action2(@RequestParam String from, @RequestParam String to) {
    return Map.of("data", service.appointments(from, to));
  }

  @PostMapping("/appointments")
  public Object action3(@RequestBody JsonNode j) {
    return Map.of("data", service.create(j));
  }

  @PutMapping("/appointments/{id}")
  public Object action4(@PathVariable UUID id, @RequestBody JsonNode j) {
    return Map.of("data", service.update(id, j));
  }

  @PatchMapping("/appointments/{id}/status")
  public Object action5(@PathVariable UUID id, @RequestBody JsonNode j) {
    return Map.of("data", service.status(id, j));
  }
}
