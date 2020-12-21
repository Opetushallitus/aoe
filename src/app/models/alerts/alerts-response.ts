export interface AlertsResponse {
  allas: AlertBody;
  login: AlertBody;
}

export interface AlertBody {
  enabled: '1' | '0';
  message: string;
  alertType: string;
}
