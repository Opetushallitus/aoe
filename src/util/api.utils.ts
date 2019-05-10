import rp from "request-promise";

import { HttpHeaders } from "../models/httpheaders";

export async function getDataFromApi(api: string, route: string, headers: HttpHeaders): Promise<any> {
  const options = {
    url: `${api}${route}`,
    headers: headers
  };

  const body = await rp.get(options);

  if (headers.Accept === "application/json") {
    return JSON.parse(body);
  } else {
    return body;
  }
}
