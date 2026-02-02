package com.parikshasetu.courseservice.controller;

import com.parikshasetu.courseservice.model.Material;
import com.parikshasetu.courseservice.repository.MaterialRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/materials")
public class MaterialController {

    private final MaterialRepository materialRepository;
    private final Path fileStorageLocation;

    public MaterialController(MaterialRepository materialRepository) {
        this.materialRepository = materialRepository;
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    @PostMapping("/course/{courseId}")
    public ResponseEntity<Material> uploadMaterial(@PathVariable Long courseId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description) {
        try {
            // Normalize file name
            String originalFileName = org.springframework.util.StringUtils.cleanPath(file.getOriginalFilename());
            String fileName = UUID.randomUUID().toString() + "_" + originalFileName;

            // Copy file to the target location (Replacing existing file with the same name)
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            Material material = new Material();
            material.setTitle(title);
            material.setDescription(description);
            material.setFileUrl(fileName); // Store just the filename
            material.setContentType(file.getContentType());
            material.setCourseId(courseId);

            return ResponseEntity.ok(materialRepository.save(material));
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + file.getOriginalFilename() + ". Please try again!",
                    ex);
        }
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Material>> getMaterialsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(materialRepository.findByCourseId(courseId));
    }

    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType("application/octet-stream"))
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}
