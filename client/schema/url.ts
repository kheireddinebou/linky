import * as yup from "yup";

export const urlSchema = yup.object({
  original_url: yup
    .string()
    .url("Please enter a valid URL")
    .required("URL is required"),
  title: yup.string().optional(),
});
