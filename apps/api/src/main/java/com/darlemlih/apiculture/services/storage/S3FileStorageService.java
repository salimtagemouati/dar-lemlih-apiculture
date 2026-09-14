package com.darlemlih.apiculture.services.storage;

import com.darlemlih.apiculture.config.properties.AwsProperties;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.util.UUID;

@RequiredArgsConstructor
public class S3FileStorageService implements FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(S3FileStorageService.class);

    private final S3Client s3Client;
    private final AwsProperties awsProperties;

    @Override
    public FileUploadResult store(FileUploadRequest request) {
        try {
            String extension = resolveExtension(request);
            String key = buildObjectKey(request.getDirectory(), extension);

            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(awsProperties.getS3().getBucket())
                    .key(key)
                    .contentType(request.getContentType())
                    .contentLength(request.getSize())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromBytes(request.getBytes()));

            String publicUrl = buildPublicUrl(key);

            log.debug("Stored file in S3 bucket '{}' with key '{}' (public URL: {})",
                    awsProperties.getS3().getBucket(), key, publicUrl);

            return FileUploadResult.builder()
                    .key(key)
                    .url(publicUrl)
                    .contentType(request.getContentType())
                    .size(request.getSize())
                    .build();
        } catch (S3Exception e) {
            throw new StorageException("Unable to store file in S3", e);
        }
    }

    @Override
    public void delete(String key) {
        if (key == null || key.isBlank()) {
            return;
        }
        try {
            s3Client.deleteObject(builder -> builder
                    .bucket(awsProperties.getS3().getBucket())
                    .key(key));
            log.debug("Deleted S3 object with key '{}'", key);
        } catch (S3Exception e) {
            throw new StorageException("Unable to delete file '" + key + "' from S3", e);
        }
    }

    private String buildObjectKey(String directory, String extension) {
        String generatedName = UUID.randomUUID().toString().replace("-", "") + extension;
        if (!StringUtils.hasText(directory)) {
            return generatedName;
        }
        String sanitized = directory.replace("\\", "/");
        if (sanitized.startsWith("/")) {
            sanitized = sanitized.substring(1);
        }
        if (sanitized.endsWith("/")) {
            sanitized = sanitized.substring(0, sanitized.length() - 1);
        }
        return sanitized + "/" + generatedName;
    }

    private String resolveExtension(FileUploadRequest request) {
        String filename = request.getOriginalFilename();
        if (StringUtils.hasText(filename) && filename.contains(".")) {
            return filename.substring(filename.lastIndexOf(".")).toLowerCase();
        }
        String contentType = request.getContentType();
        if (StringUtils.hasText(contentType)) {
            return switch (contentType) {
                case "image/png" -> ".png";
                case "image/webp" -> ".webp";
                case "image/gif" -> ".gif";
                case "image/jpeg" -> ".jpg";
                default -> ".bin";
            };
        }
        return ".bin";
    }

    private String buildPublicUrl(String key) {
        String base = StringUtils.hasText(awsProperties.getPublicEndpoint())
                ? awsProperties.getPublicEndpoint()
                : awsProperties.getEndpoint();

        String bucket = awsProperties.getS3().getBucket();
        String normalizedBase = base.endsWith("/") ? base.substring(0, base.length() - 1) : base;
        return normalizedBase + "/" + bucket + "/" + key;
    }
}
