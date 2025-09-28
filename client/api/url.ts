// createUrlApi.ts
import { AxiosResponse } from "axios";
import { userRequest } from ".";

export interface CreateUrlDto {
  original_url: string;
  title?: string;
}

export async function createUrl(data: CreateUrlDto): Promise<URLItem> {
  const res: AxiosResponse<URLItem> = await userRequest.post("/url", data);
  return res.data;
}

export async function getUrls(): Promise<URLItem[]> {
  const res: AxiosResponse<URLItem[]> = await userRequest.get("/url");
  return res.data;
}

export async function getUrl(id: string): Promise<URLItem> {
  const res: AxiosResponse<URLItem> = await userRequest.get(`/url/${id}`);
  return res.data;
}

export async function updateUrl(
  id: string,
  data: Partial<CreateUrlDto>
): Promise<URLItem> {
  const res: AxiosResponse<URLItem> = await userRequest.put(`/url/${id}`, data);
  return res.data;
}

export async function deleteUrl(id: string): Promise<void> {
  await userRequest.delete(`/url/${id}`);
}

export async function fetchUrlTitleSuggestions(url: string): Promise<string[]> {
  const res: AxiosResponse<any> = await userRequest.get(
    "/url/title/suggestions",
    {
      params: { url },
    }
  );

  return res.data?.suggestions;
}
