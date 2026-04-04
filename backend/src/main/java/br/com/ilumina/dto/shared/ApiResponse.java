package br.com.ilumina.dto.shared;

import java.time.OffsetDateTime;
import java.util.List;

public record ApiResponse<T> (
        OffsetDateTime timestamp,
        int status,
        boolean success,
        String message,
        T data,
        List<String> errors,
        String path
) {

    public static <T> ApiResponse<T> sucess(int status, String message, T data, String path) {
        return new ApiResponse<>(OffsetDateTime.now(), status, true, message, data, null, path);
    }

    public static <T> ApiResponse<T> error(int status, String message, List<String> errors, String path) {
        return new ApiResponse<>(OffsetDateTime.now(), status, false, message, null, errors, path);
    }
}
