export interface SignUpTypes {
  email: string;
  userName: string;
  password: string;
}

export interface SignInTypes {
  email: string;
  password: string;
}

export interface Card {
  id: number;
  cardHolderName: string;
  maskedCardNumber: string;
  last4: string;
  expiryDate: string;
  cvv: string;
  spendingLimit: number;
  status: string;
  createdAt: string;
}

export interface CardResponse {
  success: boolean;
  message: string;
  data: Card;
}

export interface Wallet {
  id: number;
  balance: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletResponse {
  success: boolean;
  message: string;
  data: Wallet;
}

export interface FundWalletRequest {
  amount: number;
}

export interface fundWalletResponse {
  success: boolean;
  message: string;
}
