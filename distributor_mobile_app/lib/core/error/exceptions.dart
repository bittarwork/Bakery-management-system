// Base exception class
abstract class ApiException implements Exception {
  final String message;
  const ApiException(this.message);

  @override
  String toString() => message;
}

// Network-related exceptions
class NetworkException extends ApiException {
  const NetworkException(super.message);
}

class ServerException extends ApiException {
  const ServerException(super.message);
}

// HTTP status code exceptions
class BadRequestException extends ApiException {
  const BadRequestException(super.message);
}

class UnauthorizedException extends ApiException {
  const UnauthorizedException(super.message);
}

class ForbiddenException extends ApiException {
  const ForbiddenException(super.message);
}

class NotFoundException extends ApiException {
  const NotFoundException(super.message);
}

// Cache exceptions
class CacheException extends ApiException {
  const CacheException(super.message);
}

// Local storage exceptions
class StorageException extends ApiException {
  const StorageException(super.message);
}

// Location/GPS exceptions
class LocationException extends ApiException {
  const LocationException(super.message);
}

// Permission exceptions
class PermissionException extends ApiException {
  const PermissionException(super.message);
} 