import { AxiosResponse } from "axios";
import { publicRequest } from ".";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function register(data: any) {
  const response: AxiosResponse = await publicRequest.post(
    "/auth/register",
    data
  );
  return response.data;
}

export async function login(data: { email: string; password: string }) {
  const response: AxiosResponse = await publicRequest.post("/auth/login", data);
  return response.data;
}
