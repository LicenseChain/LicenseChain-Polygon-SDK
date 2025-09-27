export class PolygonError extends Error {
  public readonly code: string;
  public readonly data?: any;

  constructor(message: string, code: string, data?: any) {
    super(message);
    this.name = 'PolygonError';
    this.code = code;
    this.data = data;
  }
}

export class InsufficientBalanceError extends PolygonError {
  constructor(required: string, available: string) {
    super(
      `Insufficient balance. Required: ${required}, Available: ${available}`,
      'INSUFFICIENT_BALANCE',
      { required, available }
    );
  }
}

export class TransactionFailedError extends PolygonError {
  constructor(hash: string, reason: string) {
    super(
      `Transaction failed: ${reason}`,
      'TRANSACTION_FAILED',
      { hash, reason }
    );
  }
}

export class LicenseNotFoundError extends PolygonError {
  constructor(licenseId: string) {
    super(
      `License not found: ${licenseId}`,
      'LICENSE_NOT_FOUND',
      { licenseId }
    );
  }
}

export class NFTNotFoundError extends PolygonError {
  constructor(tokenId: string) {
    super(
      `NFT not found: ${tokenId}`,
      'NFT_NOT_FOUND',
      { tokenId }
    );
  }
}

export class InvalidAmountError extends PolygonError {
  constructor(amount: string) {
    super(
      `Invalid amount: ${amount}`,
      'INVALID_AMOUNT',
      { amount }
    );
  }
}

export class NetworkError extends PolygonError {
  constructor(message: string) {
    super(
      `Network error: ${message}`,
      'NETWORK_ERROR',
      { message }
    );
  }
}

export class ContractError extends PolygonError {
  constructor(method: string, reason: string) {
    super(
      `Contract error in ${method}: ${reason}`,
      'CONTRACT_ERROR',
      { method, reason }
    );
  }
}
