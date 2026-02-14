package com.parikshasetu.courseservice.repository;

import com.parikshasetu.courseservice.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByCourseId(Long courseId);

    Long countByCourseIdIn(List<Long> courseIds);
}
