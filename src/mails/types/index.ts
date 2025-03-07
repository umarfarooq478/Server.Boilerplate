export interface IAccountConfirmation {
  displayName: string;
  email: string;
  url: string;
}

export interface IForgotPassword {
  displayName: string;
  email: string;
  url: string;
}

export interface IAccountConfirmationInstructor {
  displayName: string;
  email: string;
}

export interface IPaymentConfirmationClient {
  displayName: string;
  email: string;
  traxId: string;
  traxDate: string;
  amount: string;
  product: string;
}

export interface IContactUs {
  displayName: string;
  email: string;
  message: string;
}
