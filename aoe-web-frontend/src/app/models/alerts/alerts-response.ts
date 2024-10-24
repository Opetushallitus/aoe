export interface AlertsResponse {
  allas: AlertBody;
  login: AlertBody;
}

export interface AlertBody {
  enabled: '1' | '0';
  message: {
    fi: string;
    en: string;
    sv: string;
  };
  alertType: string;
}
