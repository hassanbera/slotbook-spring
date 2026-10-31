package dev.bera.app.repository;

import dev.bera.app.model.Employee;
import jakarta.persistence.LockModeType;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select x from Employee x where x.id=:id")
  Optional<Employee> lock(@Param("id") UUID id);
}
