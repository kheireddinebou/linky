import { AxiosResponse } from "axios";
import { userRequest } from ".";

export async function fetchCurrentUser(): Promise<User> {
  const res: AxiosResponse<User> = await userRequest.get("/user/getUserData");
  return res.data;
}
