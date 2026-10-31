package dev.bera.app.repository;

import dev.bera.app.model.Appointment;
import jakarta.persistence.LockModeType;
import java.util.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface AppointmentRepository
  extends JpaRepository<Appointment, UUID>
{
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select x from Appointment x where x.id=:id")
  Optional<Appointment> lock(@Param("id") UUID id);

  List<Appointment> findByStartAtLessThanAndEndAtGreaterThanOrderByStartAt(
    java.time.Instant to,
    java.time.Instant from
  );
}
